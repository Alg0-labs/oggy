import Foundation

class ModelManager {
  private let fileManager = FileManager.default
  private var activeTasks: [String: URLSessionDownloadTask] = [:]

  private static let modelRegistry: [String: String] = [
    "gemma-3-4b-it-4bit": "mlx-community/gemma-3-4b-it-4bit",
    "gemma-3-8b-it-4bit": "mlx-community/gemma-3-8b-it-4bit",
  ]

  private var modelsDirectory: URL {
    let docs = fileManager.urls(for: .documentDirectory, in: .userDomainMask)[0]
    return docs.appendingPathComponent("models", isDirectory: true)
  }

  func getModelPath(modelId: String) -> String? {
    let path = modelsDirectory.appendingPathComponent(modelId)
    guard fileManager.fileExists(atPath: path.path) else { return nil }
    return path.path
  }

  func isModelDownloaded(modelId: String) -> Bool {
    let path = modelsDirectory.appendingPathComponent(modelId)
    var isDir: ObjCBool = false
    return fileManager.fileExists(atPath: path.path, isDirectory: &isDir) && isDir.boolValue
  }

  func getModelSizeOnDisk(modelId: String) -> Int {
    let path = modelsDirectory.appendingPathComponent(modelId)
    guard let enumerator = fileManager.enumerator(at: path, includingPropertiesForKeys: [.fileSizeKey]) else {
      return 0
    }
    var total = 0
    for case let file as URL in enumerator {
      if let size = try? file.resourceValues(forKeys: [.fileSizeKey]).fileSize {
        total += size
      }
    }
    return total
  }

  func downloadModel(modelId: String, onProgress: @escaping (Double) -> Void) async throws {
    guard let repoId = Self.modelRegistry[modelId] else {
      throw ModelError.downloadFailed("Unknown model: \(modelId)")
    }

    // Check disk space
    let availableSpace = try getAvailableDiskSpace()
    let requiredSpace: Int64 = modelId.contains("8b") ? 5_500_000_000 : 3_000_000_000
    guard availableSpace > requiredSpace else {
      throw ModelError.insufficientDiskSpace
    }

    let modelDir = modelsDirectory.appendingPathComponent(modelId)
    try? fileManager.createDirectory(at: modelDir, withIntermediateDirectories: true)

    // Download model files from Hugging Face
    let filesToDownload = [
      "config.json",
      "tokenizer.json",
      "tokenizer_config.json",
      "special_tokens_map.json",
    ]

    // Find weight files (sharded)
    let weightFiles = try await listRepoFiles(repoId: repoId, extension: ".safetensors")
    let allFiles = filesToDownload + weightFiles

    for (index, filename) in allFiles.enumerated() {
      let url = URL(string: "https://huggingface.co/\(repoId)/resolve/main/\(filename)")!
      let destFile = modelDir.appendingPathComponent(filename)

      // Skip if already downloaded
      if fileManager.fileExists(atPath: destFile.path) {
        let baseProgress = Double(index) / Double(allFiles.count)
        onProgress(baseProgress + 1.0 / Double(allFiles.count))
        continue
      }

      // Create subdirectories if needed
      let parentDir = destFile.deletingLastPathComponent()
      try? fileManager.createDirectory(at: parentDir, withIntermediateDirectories: true)

      let (tempURL, _) = try await URLSession.shared.download(from: url)
      try fileManager.moveItem(at: tempURL, to: destFile)

      let progress = Double(index + 1) / Double(allFiles.count)
      onProgress(progress)
    }

    onProgress(1.0)
  }

  func cancelDownload(modelId: String) {
    activeTasks[modelId]?.cancel()
    activeTasks.removeValue(forKey: modelId)
  }

  func deleteModel(modelId: String) throws {
    let path = modelsDirectory.appendingPathComponent(modelId)
    if fileManager.fileExists(atPath: path.path) {
      try fileManager.removeItem(at: path)
    }
  }

  private func getAvailableDiskSpace() throws -> Int64 {
    let values = try URL(fileURLWithPath: NSHomeDirectory())
      .resourceValues(forKeys: [.volumeAvailableCapacityForImportantUsageKey])
    return values.volumeAvailableCapacityForImportantUsage ?? 0
  }

  private func listRepoFiles(repoId: String, extension ext: String) async throws -> [String] {
    let apiURL = URL(string: "https://huggingface.co/api/models/\(repoId)")!
    let (data, _) = try await URLSession.shared.data(from: apiURL)

    guard let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
          let siblings = json["siblings"] as? [[String: Any]] else {
      // Fallback to common weight file patterns
      return ["model.safetensors"]
    }

    return siblings
      .compactMap { $0["rfilename"] as? String }
      .filter { $0.hasSuffix(ext) }
  }
}

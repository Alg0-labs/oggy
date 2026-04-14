import ExpoModulesCore

public class OggyMLXModule: Module {
  private let modelManager = ModelManager()
  private let inferenceEngine = InferenceEngine()

  public func definition() -> ModuleDefinition {
    Name("OggyMLX")

    Events("onDownloadProgress")

    AsyncFunction("downloadModel") { (modelId: String) in
      try await self.modelManager.downloadModel(
        modelId: modelId,
        onProgress: { progress in
          self.sendEvent("onDownloadProgress", [
            "modelId": modelId,
            "progress": progress
          ])
        }
      )
    }

    AsyncFunction("cancelDownload") { (modelId: String) in
      self.modelManager.cancelDownload(modelId: modelId)
    }

    AsyncFunction("deleteModel") { (modelId: String) in
      try self.modelManager.deleteModel(modelId: modelId)
    }

    AsyncFunction("isModelDownloaded") { (modelId: String) -> Bool in
      return self.modelManager.isModelDownloaded(modelId: modelId)
    }

    AsyncFunction("getModelSizeOnDisk") { (modelId: String) -> Int in
      return self.modelManager.getModelSizeOnDisk(modelId: modelId)
    }

    AsyncFunction("loadModel") { (modelId: String) in
      let modelPath = self.modelManager.getModelPath(modelId: modelId)
      guard let path = modelPath else {
        throw ModelError.notDownloaded(modelId)
      }
      try await self.inferenceEngine.loadModel(path: path)
    }

    AsyncFunction("unloadModel") {
      self.inferenceEngine.unloadModel()
    }

    AsyncFunction("isModelLoaded") { () -> Bool in
      return self.inferenceEngine.isModelLoaded
    }

    AsyncFunction("generate") { (systemPrompt: String, userPrompt: String, maxTokens: Int, temperature: Float) -> String in
      guard self.inferenceEngine.isModelLoaded else {
        throw ModelError.notLoaded
      }
      return try await self.inferenceEngine.generate(
        systemPrompt: systemPrompt,
        userPrompt: userPrompt,
        maxTokens: maxTokens,
        temperature: temperature
      )
    }
  }
}

enum ModelError: Error, LocalizedError {
  case notDownloaded(String)
  case notLoaded
  case downloadFailed(String)
  case generationFailed(String)
  case insufficientDiskSpace

  var errorDescription: String? {
    switch self {
    case .notDownloaded(let id):
      return "Model '\(id)' is not downloaded"
    case .notLoaded:
      return "No model is loaded. Load a model first."
    case .downloadFailed(let reason):
      return "Download failed: \(reason)"
    case .generationFailed(let reason):
      return "Generation failed: \(reason)"
    case .insufficientDiskSpace:
      return "Insufficient disk space to download model"
    }
  }
}

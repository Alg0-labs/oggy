import type { Ionicons } from '@expo/vector-icons'
import type { ReactNode } from 'react'

export type IoniconName = React.ComponentProps<typeof Ionicons>['name']

export interface TabConfig {
  key: string
  label: string
  icon: IoniconName
  iconActive?: IoniconName
  badge?: number
  render?: () => ReactNode
}

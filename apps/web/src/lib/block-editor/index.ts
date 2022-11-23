export enum NodeType {
  text = 'text',
  image = 'image',
}

export interface TextNode {
  id: string
  type: NodeType.text
  /** html like content */
  content: string
}

export interface ImageNode {
  id: string
  type: NodeType.image
  url: string
  path: string
}

export type Node = {
  type: NodeType
}

export type BlocksNodes<T extends Node> = {
  nodes: T[]
}

export { default as BlockEditor } from './BlockEditor.svelte'

export enum NodeType {
  text = 'text',
}

export interface TextNode {
  id: string
  type: NodeType.text
  /** html like content */
  content: string
}

export type Node = TextNode

export type BlocksNodes = {
  nodes: Node[]
}

export { default as BlockEditor } from './BlockEditor.svelte'

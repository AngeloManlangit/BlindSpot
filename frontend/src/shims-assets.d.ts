// Allow importing image and media assets in TypeScript/Vue files
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.svg' {
  const content: any;
  export default content;
}

export const downlod = (url,filename) =>{
  const link = document.createElement('a')
  link.href = url
  link.download =filename|| true
  link.click()
  URL.revokeObjectURL(url)
} 
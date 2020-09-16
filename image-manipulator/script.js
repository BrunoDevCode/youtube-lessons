const photoFile = document.querySelector('#photo-file')
let photoPreview = document.querySelector('#photo-preview')
let image
let photoName = ''
// Select & Preview Image

document.querySelector('#select-image')
  .addEventListener('click', () => {
    photoFile.click()
  })

window.addEventListener('DOMContentLoaded', () => {
  photoFile.addEventListener('change', () => {
    let file = photoFile.files.item(0)
    photoName = file.name
    // Ler um arquivo
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = function (event) {
      image = new Image()
      image.src = event.target.result
      image.onload = onLoadImg
    }
  })
})


// Selection Tool

const selection = document.querySelector('#selection-tool')

let startX, startY, relativeStartX, relativeStartY,
  endX, endY, relativeEndX, relativeEndY
let startSelection = false

const events = {
  mouseover() {
    // "this" se refere a que esta disparando o evento
    this.style.cursor = 'crosshair'
  },
  mousedown() {
    const { clientX, clientY, offsetX, offsetY } = event

    // console.table({
    //   'client': [clientX, clientY],
    //   'offset': [offsetX, offsetY]
    // })

    startX = clientX
    startY = clientY
    relativeStartX = offsetX
    relativeStartY = offsetY

    startSelection = true
  },
  mousemove() {
    endX = event.clientX
    endY = event.clientY

    if (startSelection) {
      selection.style.display = 'initial'
      selection.style.top = startY + 'px'
      selection.style.left = startX + 'px'

      selection.style.width = (endX - startX) + 'px'
      selection.style.height = (endY - startY) + 'px'
    }
  },
  mouseup() {
    startSelection = false

    // Calculo de onde esta o mouse na tela
    // Horizontal
    relativeEndX = event.layerX
    // Vertical
    relativeEndY = event.layerY

    // Mostrar o botão de crop
    cropButton.style.display = 'initial'
  }
}

Object.keys(events)
  // Para cada um deles roda uma funcionalidade
  .forEach(eventName => {
    photoPreview.addEventListener(eventName, events[eventName])
  })

// Canvas
let canvas = document.createElement('canvas')
let ctx = canvas.getContext('2d')

function onLoadImg () {
  const { width, height } = image
  canvas.width = width
  canvas.height = height

  // Limpar ctx
  ctx.clearRect(0, 0, width, height)

  // Desenhar img no ctx
  ctx.drawImage(image, 0, 0)

  photoPreview.src = canvas.toDataURL()
}

// Cortar Image
const cropButton = document.querySelector('#crop-image')
cropButton.onclick = () => {
  const { width: imgW, height: imgH } = image
  const { width: previewW, height: previewH } = photoPreview

  const [widthFactor, heightFactor] = [
    +(imgW / previewW),
    +(imgH / previewH)
  ]

  const [selectionWidth, selectionHeight] = [
    +selection.style.width.replace('px', ''),
    +selection.style.height.replace('px', ''),
  ]

  const [croppedWidth, croppedHeight] = [
    +(selectionWidth * widthFactor),
    +(selectionHeight * heightFactor)
  ]

  const [actualX, actualY] = [
    +(relativeStartX * widthFactor),
    +(relativeStartY * heightFactor)
  ]

  // Pegar do ctx a imagem cortada
  const croppedImage = ctx.getImageData(actualX, actualY, croppedWidth, croppedHeight)

  // Limpar o ctx
  ctx.clearRect(0, 0, ctx.width, ctx.height)

  // Ajuste de proporções
  image.width = canvas.width = croppedWidth
  image.height = canvas.height = croppedHeight

  // Adicionar image cortada ao ctx
  ctx.putImageData(croppedImage, 0, 0)

  // Esconder a ferramenta de seleção
  selection.style.display = 'none'

  // Atualizar o preview da image
  photoPreview.src = canvas.toDataURL()

  // Mostrar o botão de download
  downloadButton.style.display = 'initial'
}

const downloadButton = document.querySelector('#download')
downloadButton.onclick = function() {
  const a = document.createElement('a')
  a.download = photoName + '-cropped.png'
  a.href = canvas.toDataURL()
  a.click()
}

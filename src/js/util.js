exports.generateColor = () => {
  const colorArray = []
  for (let i = 0; i <= 2; i += 1) {
    const randomInt = Math.round(Math.random() * 255)
    colorArray.push(randomInt)
  }
  const colorArrayString = colorArray.join(', ')
  const rgb = `rgb(${colorArrayString})`
  return rgb
}

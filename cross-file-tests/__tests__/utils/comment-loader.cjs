module.exports = (result) => {
    return `/* CSS Test Result:\n${
      // escape comment end
      String(result).replace(
        /\*\//g,
        "* /"
      )
    }\n*/`
  }
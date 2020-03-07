export const extractImgPathFromHTML = (html: string) => {
  const result: Array<string> = [];

  let imgStringStartIdx = 0;
  for (let i = 9; i < html.length; i++) {
    const char = html[i];
    const prevStr = html.slice(i - 9, i);

    if (prevStr === 'src="blob') {
      imgStringStartIdx = i - 4;
    }
    if (imgStringStartIdx !== 0 && char === '"') {
      result.push(html.slice(imgStringStartIdx, i));
      imgStringStartIdx = 0;
    }
  }
  return result;
};

export const replaceImgPathToLocal = (html: string, imagePathArr: Array<string>) => {
  let imgStringStartIdx = 0;
  let replaceHtml = html;

  let imageCounter = 0;
  let i = 9;
  while (i <= replaceHtml.length) {
    const char = replaceHtml[i];
    const prevStr = replaceHtml.slice(i - 9, i);

    if (prevStr === 'src="blob') {
      imgStringStartIdx = i - 4;
    }
    if (imgStringStartIdx !== 0 && char === '"') {
      replaceHtml = replaceStringWithIdx(
        replaceHtml,
        imgStringStartIdx,
        i - 1,
        imagePathArr[imageCounter]
      );
      imgStringStartIdx = 0;
      const originalPathLength = i - imgStringStartIdx;
      i += imagePathArr[imageCounter].length - originalPathLength;
      imageCounter += 1;
    }
    i += 1;
  }

  return replaceHtml;
};

const replaceStringWithIdx = (
  originalText: string,
  startIdx: number,
  endIdx: number,
  replaceText: string
) => {
  const leftText = originalText.slice(0, startIdx);
  const rightText = originalText.slice(endIdx + 1, originalText.length);
  console.log(leftText);
  console.log('----');
  console.log(replaceText);
  console.log('----');
  console.log(rightText);

  return leftText + 'file://' + replaceText + rightText;
};

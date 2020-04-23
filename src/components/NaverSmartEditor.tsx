import * as React from 'react';
import { remote } from 'electron';
import { ChangeEvent, useEffect, useState } from 'react';
import * as path from 'path';
import { InputNumber, message, Spin } from 'antd';
import { saveFile } from '../ipc/renderer-IPC';
import styled from 'styled-components';

const S = {
  ImgAddDiv: styled.div`
    font-size: 1rem;
    border: 1px solid black;
    margin: 0.5rem 0;
    padding: 0.5rem;
    p {
      margin-top: 0.5rem;
      margin-bottom: 0.3rem;
    }
  `,
  ImgAddTitle: styled.p`
    margin: 0;
    font-size: 1.2rem;
  `
};

// @ts-ignore
const postscribe = require('postscribe');
const appPath = remote.app.getAppPath();

const NaverSmartEditor: React.FC = () => {
  const [width, setWidth] = useState(740);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const env = remote.process.env.NODE_ENV;
    let HuskyEZCreator;
    let SkinUrl;
    if (env === 'development') {
      const isWin = remote.process.platform === 'win32';
      if (isWin) {
        HuskyEZCreator = path.join('/', 'public', 'NSE2', 'js', 'service', 'HuskyEZCreator.js');
        SkinUrl = path.join('/', 'public', 'NSE2', 'SmartEditor2Skin.html');
        console.log(HuskyEZCreator, SkinUrl);
      } else {
        HuskyEZCreator = path.resolve('/', 'public', 'NSE2', 'js', 'service', 'HuskyEZCreator.js');
        SkinUrl = path.resolve('/', 'public', 'NSE2', 'SmartEditor2Skin.html');
      }
    } else {
      HuskyEZCreator = path.resolve(
        appPath,
        '..',
        'app.asar.unpacked',
        'dist',
        'public',
        'NSE2',
        'js',
        'service',
        'HuskyEZCreator.js'
      );
      SkinUrl = path.resolve(
        appPath,
        '..',
        'app.asar.unpacked',
        'dist',
        'public',
        'NSE2',
        'SmartEditor2Skin.html'
      );
    }
    postscribe('#loadEditor', '<script src="' + HuskyEZCreator + '" charset="utf-8"></script>');
    postscribe(
      '#editor',
      '<div>' + '<textarea name="ir1" id="ir1" rows="10" cols="60"/>' + '</div>'
    );
    SkinUrl = SkinUrl.replace(/\\/g, '/');
    postscribe(
      '#afterEditor',
      '<script type="text/javascript">' +
        'var oEditors = [];nhn.husky.EZCreator.createInIFrame({ oAppRef: oEditors, elPlaceHolder: "ir1", sSkinURI: "' +
        SkinUrl +
        '", fCreator: "createSEditor2"});' +
        'function submitContents(elClickedObj) { oEditors.getById["ir1"].exec("UPDATE_CONTENTS_FIELD", []);};' +
        'function addText(text) { oEditors.getById["ir1"].exec("PASTE_HTML", [text]); }' +
        'function addImg(src, width) {' +
        'var imageHTML = "<img width=\'" + width + "\' " + "class=\'img-attachment\' src=\'" + src + "\' />";' +
        'console.log(imageHTML);' +
        'oEditors.getById["ir1"].exec("PASTE_HTML", [imageHTML]);' +
        '}' +
        '</script>'
    );
  }, []);

  const addImgToEditor = (path: string, width: number) => {
    postscribe(
      '#afterEditor',
      `
      <script type="text/javascript">
      addImg("${path}", ${width});
      </script>
      `
    );
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      try {
        setLoading(true);
        const filePaths = [];

        for (let i = 0; i < e.target.files.length; i++) {
          const file = e.target.files[i];
          filePaths.push(file.path);
        }
        const result = await saveFile(filePaths);
        for (let i = 0; i < result.length; i++) {
          addImgToEditor(result[i], width);
        }
      } catch (e) {
        message.warn('로그인 상태가 풀렸습니다. 메인 대쉬보드에서 로그인을 다시 진행해주세요.');
      }
      setLoading(false);
    }
  };

  return (
    <>
      <Spin tip="업로드 중 입니다..." spinning={loading}>
        <S.ImgAddDiv>
          <S.ImgAddTitle>본문 내 사진 추가</S.ImgAddTitle>
          <p>1. 사진 넓이 설정(네이버 기본값 740)</p>
          <InputNumber
            min={100}
            max={1080}
            defaultValue={740}
            onChange={value => value && setWidth(value)}
          />
          <p>2. 파일 선택</p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            onClick={(e: any) => (e.target.value = null)}
          />
        </S.ImgAddDiv>
        <div id={'loadEditor'} />
        <div id={'editor'} />
        <div id={'afterEditor'} />
        <div id={'tester'} />
      </Spin>
    </>
  );
};

export default NaverSmartEditor;

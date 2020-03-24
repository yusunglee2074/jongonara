import * as React from 'react';
import { remote } from 'electron';
import { ChangeEvent, useEffect, useState } from 'react'
import * as path from 'path';
import { InputNumber, Col, Row, Spin } from 'antd'
import { saveFile } from '../ipc/renderer-IPC'

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
      HuskyEZCreator = path.resolve('/', 'public', 'NSE2', 'js', 'service', 'HuskyEZCreator.js');
      SkinUrl = path.resolve('/', 'public', 'NSE2', 'SmartEditor2Skin.html');
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
      const isWin = remote.process.platform === 'win32';
      if (isWin) {
        SkinUrl = SkinUrl.replace(/\\/g, '/');
      }
    }
    postscribe('#loadEditor', '<script src="' + HuskyEZCreator + '" charset="utf-8"></script>');
    postscribe(
      '#editor',
      '<div>' + '<textarea name="ir1" id="ir1" rows="10" cols="60"/>' + '</div>'
    );
    postscribe(
      '#afterEditor',
      '<script type="text/javascript">' +
        'var oEditors = [];nhn.husky.EZCreator.createInIFrame({ oAppRef: oEditors, elPlaceHolder: "ir1", sSkinURI: "' +
        SkinUrl +
        '", fCreator: "createSEditor2"});' +
        'function submitContents(elClickedObj) { oEditors.getById["ir1"].exec("UPDATE_CONTENTS_FIELD", []);};' +
        'function addText(text) { oEditors.getById["ir1"].exec("PASTE_HTML", [text]); }' +
        'function addImg(src, width) {' +
        'var imageHTML = "<img width=\'" + width + "\' " + "src=\'" + src + "\' />";' +
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
      setLoading(true);
      const filePaths = [];

      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        filePaths.push(file.path);
      }
      try {
        const result = await saveFile(filePaths);
        for (let i = 0; i < result.length; i++) {
          addImgToEditor(result[i], width);
        }
      } catch (e) {
        if (e.message.indexOf('browsers.imageUpload') > -1) {
          //TODO: 에러 메시지
          console.log('메인 대쉬보드에서 로그인을 먼저 진행해주세요.')
        }
      }
      setLoading(false);
    }
  }

  return (
    <>
      <Spin tip="업로드 중 입니다..." spinning={loading}>
      <Row style={{ fontSize: 16}}>
        <Col span={7}>
          <span>본문에 사진추가</span>
          <input type="file" accept="image/*" multiple onChange={handleUpload} />
          <span>사진 넓이</span>
          <InputNumber
            min={100}
            max={1080}
            defaultValue={740}
            onChange={(e: any) => setWidth(e.target.value)}
          />
        </Col>
      </Row>
      <div id={'loadEditor'} />
      <div id={'editor'} />
      <div id={'afterEditor'} />
      <div id={'tester'} />
      </Spin>
    </>
  );
};

export default NaverSmartEditor;

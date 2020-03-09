import * as React from 'react';
import { remote } from 'electron';
import { ChangeEvent, useEffect, useState } from 'react'
import * as path from 'path';
import { InputNumber, Col, Row } from 'antd';
import { saveFile } from '../ipc/renderer-IPC'

// @ts-ignore
const postscribe = require('postscribe');
const appPath = remote.app.getAppPath();

const NaverSmartEditor: React.FC = () => {
  const [, setWidth] = useState(740);

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

  // const props = {
  //   name: 'file',
  //   multiple: true,
  //   showUploadList: false,
  //   onChange: async (info: any) => {
  //     let result;
  //     console.log(info.file, info.fileList);
  //     if (info.file) {
  //     } else if (info.fileList) {
  //       result = await saveFile(info.fileList.map((el: any) => el.originFileObj));
  //     }
  //     message.success(`추가 되었습니다.`);
  //     for (let i = 0; i < result.length; i++) {
  //       addImgToEditor(result[i]);
  //     }
  //   }
  // };

  const addImgToEditor = (path: string) => {
    postscribe(
      '#afterEditor',
      `
      <script type="text/javascript">
      addImg("${path}");
      </script>
      `
    );
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filePaths = [];

      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        filePaths.push(file.path);
      }
      const result = await saveFile(filePaths);
      for (let i = 0; i < result.length; i++) {
        addImgToEditor(result[i]);
      }

    }
  }

  return (
    <>
      <Row>
        <Col span={4}>
          <input type="file" accept="image/*" multiple onChange={handleUpload} />
        </Col>
        <Col span={4}>
          <span style={{ fontSize: 18 }}>사진 넓이</span>
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
    </>
  );
};

export default NaverSmartEditor;

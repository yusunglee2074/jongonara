import * as React from 'react';
import { Button, Row, Col, Input, Checkbox, InputNumber } from 'antd';
import styled from 'styled-components';
import { useEffect } from 'react';
import { useState } from 'react';
import { ITemplate } from '../../../store/Store';

// @ts-ignore
const postscribe = require('postscribe');

const S = {
  ContainerDiv: styled.div`
    padding: 1rem;
  `,
  ContainerTitleP: styled.p`
    font-size: 2rem;
    font-weight: bold;
  `,
  HeaderRow: styled(Row)`
    font-size: 2rem;
  `,
  BodyRow: styled(Row)`
    font-size: 2rem;
  `
};

const TradeTemplateWriteScreen: React.FunctionComponent = () => {
  const [template, setTemplate] = useState({
    type: 'normal',
    price: 0,
    tags: '',
    title: '',
    text: ''
  } as ITemplate);

  useEffect(() => {
    postscribe(
      '#loadEditor',
      '<script language="javascript" src="/public/NSE2/js/service/HuskyEZCreator.js" charset="utf-8"></script>'
    );
    postscribe(
      '#editor',
      '<div>' +
        '<input id="imgfile" type="file" style="font-size: 12px;">' +
        '<span style="font-size: 12px;">사진넓이</span><input id="imgwidth" type="text" value="740" style="font-size: 12px;">' +
        '<button onclick="(function() {addImg()})()" style="font-size: 12px;">사진추가</button>' +
        '<textarea name="ir1" id="ir1" rows="10" cols="60"/>' +
        '</div>'
    );
    postscribe(
      '#afterEditor',
      '<script type="text/javascript">' +
        'var oEditors = [];nhn.husky.EZCreator.createInIFrame({ oAppRef: oEditors, elPlaceHolder: "ir1", sSkinURI: "/public/NSE2/SmartEditor2Skin.html", fCreator: "createSEditor2"});' +
        'function submitContents(elClickedObj) { oEditors.getById["ir1"].exec("UPDATE_CONTENTS_FIELD", []);};' +
        'setInterval(function() { ' +
        'submitContents(this);' +
        '}, 1000);' +
        'function addImg() {' +
        'const imgTag = document.getElementById("imgfile");' +
        'const imgFiles = imgTag.files;' +
        'const imgFile = imgTag.files[0];' +
        'const widthInput = document.getElementById("imgwidth");' +
        'const imageWidth = widthInput.value;' +
        ' imageHTML = "<img width=\'" + imageWidth + "\' " + "src=\'" + URL.createObjectURL(imgFile) + "\'/>";' +
        'oEditors.getById["ir1"].exec("PASTE_HTML", [imageHTML]);' +
        '};' +
        '</script>'
    );
  }, []);

  const save = () => {
    const textarea = document.getElementById('ir1') as HTMLTextAreaElement;
    console.log(textarea.value);
    const iframes = document.getElementsByTagName('iframe');
    const firstIframe = iframes[0];
    if (firstIframe) {
      // @ts-ignore
      const innerDoc = firstIframe.contentDocument || firstIframe.contentWindow.document;

      const secondIframe = innerDoc.getElementById('se2_iframe') as HTMLIFrameElement;
      if (secondIframe) {
        // @ts-ignore
        const secondInnerDoc = secondIframe.contentDocument || firstIframe.contentWindow.document;
        const bodies = secondInnerDoc.getElementsByTagName('body');
        const body = bodies[0];
        setTemplate({ ...template, text: body.innerHTML });
        console.log({ ...template, text: body.innerHTML });
      }
    }
  };

  return (
    <S.ContainerDiv>
      <S.HeaderRow>
        <div>
          {JSON.stringify(template)}
        </div>
        <Col span={20}>
          <S.ContainerTitleP>거래글 쓰기 화면입니다.</S.ContainerTitleP>
        </Col>
        <Col span={4}>
          <Button type="primary" onClick={save}>
            저장
          </Button>
        </Col>
        <Input
          placeholder="글 제목"
          value={template.title}
          onChange={e => setTemplate({ ...template, title: e.target.value })}
        />
        <Input
          placeholder="태그와 태그는 쉼표로 구분하며, 10개까지 입력하실 수 있습니다."
          value={template.tags}
          onChange={e => setTemplate({ ...template, tags: e.target.value })}
        />
        <InputNumber
          placeholder="판매가격"
          defaultValue={template.price === 0 ? undefined : template.price}
          onChange={num => setTemplate({ ...template, price: num })}
        />
        <Checkbox
          defaultChecked={template.exposePhoneNumber}
          checked={template.exposePhoneNumber}
          onChange={e =>
            setTemplate({
              ...template,
              exposePhoneNumber: e.target.checked,
              useTempPhoneNumber: e.target.checked
            })
          }
        >
          연락처 노출 동의
        </Checkbox>
        <Checkbox
          defaultChecked={template.useTempPhoneNumber}
          checked={template.useTempPhoneNumber}
          disabled={!template.exposePhoneNumber}
          onChange={e => setTemplate({ ...template, useTempPhoneNumber: e.target.checked })}
        >
          일회용 안심 번호 사용
        </Checkbox>{' '}
      </S.HeaderRow>
      <S.BodyRow>
        <Col span={24}>
          <div id={'loadEditor'} />
          <div id={'editor'} />
          <div id={'afterEditor'} />
        </Col>
        <img src="" />
      </S.BodyRow>
    </S.ContainerDiv>
  );
};

export default TradeTemplateWriteScreen;

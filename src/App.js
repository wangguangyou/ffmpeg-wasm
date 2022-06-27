import React, { useState } from "react";
import Loading from 'react-fullscreen-loading';
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { Modal, Radio, Button, Display,useToasts } from "@geist-ui/core";
import { MoreHorizontal } from "@geist-ui/icons";
import { downlod } from "./util";
import "./App.css";
import { useRef } from "react";
const audioTypeList = ['mp3','acc','flac','ac-3','vorbis','opus']
const videoTypeList = [
  "mp4",
  "flv",
  "avi",
  "mov",
  "wmv",
  "m4v",
  "f4v",
  "3gp",
  "ts",
  "webm",
];
const actions = [
  {
    value: -1,
    label: "选择其他视频",
  },
  {
    value: 0,
    label: "格式转换",
  },
  {
    value: 1,
    label: "提取音频",
  },
];

function App() {
  const inputFileEl = useRef(null);
  const { setToast } = useToasts()
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState();
  const [type, setType] = useState(videoTypeList[0]);
  const [audioType, setAudioType] = useState(audioTypeList[0]);
  const [more, setMore] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [audioModalVisible, setAudioModalVisible] = useState(false);

  const getType = (file) => {
    return /^video\/(.+)$/.exec(file.type)[1];
  };

  const ffmpeg = createFFmpeg({
    corePath: "./ffmpeg-core.js",
    log: true,
  });
  const doTranscode = async () => {
    setModalVisible(false);
    setLoading(true)
    setTimeout(async () => {
      let inName = `test.${getType(file)}`;
      let outName = `${Date.now()}.${type}`;
      await ffmpeg.load();
      ffmpeg.FS("writeFile", inName, await fetchFile(file));
      await ffmpeg.run("-i", inName, outName);
      const data = ffmpeg.FS("readFile", outName);
      let url = URL.createObjectURL(
        new Blob([data.buffer], { type: `video/${type}` })
      );
      downlod(url, outName);
      setLoading(false)
    }, 0);
  };
  const getAudio = ()=>{
    setAudioModalVisible(false);
    setLoading(true)
    setTimeout(async () => {
      let inName = `test.${getType(file)}`;
      let outName = `${Date.now()}.${audioType}`;
      await ffmpeg.load();
      ffmpeg.FS("writeFile", inName, await fetchFile(file));
      await ffmpeg.run("-i", inName, '-vn',outName);
      try {
        const data = ffmpeg.FS("readFile", outName);
        console.log(data)
        let url = URL.createObjectURL(
          new Blob([data.buffer], { type: `audio/${type}` })
        );
        downlod(url, outName);
      } catch (error) {
        setToast({text:'提取失败,视频可能没有音轨'})
      }
      setLoading(false)

    }, 0);
  }
  const action = (type) => {
    if (type === -1) {
      return inputFileEl.current?.click();
    }
    if (type === 0) {
      return setModalVisible(true);
    }
    if (type === 1) {
      return setAudioModalVisible(true);
    }
  };
  const onChange = (event) => {
    const {
      target: { files },
    } = event;
    console.log(files[0]);
    setFile(files[0]);
  };
  return (
    <div className="App">
      <Loading loading={loading} loaderColor="rgba(0,112,243,.6)" />
      <Modal visible={modalVisible}>
        <Modal.Title>格式转换</Modal.Title>
        <Modal.Subtitle>请选择要转换的视频格式</Modal.Subtitle>
        <Modal.Content>
          <Radio.Group
            value={type}
            onChange={(val) => setType(val)}
            useRow={!more}
          >
            {videoTypeList
              .slice(0, more ? videoTypeList.length : 4)
              .map((type) => (
                <Radio key={type} value={type}>
                  {type}
                </Radio>
              ))}
            {!more && (
              <Button
                onClick={() => setMore(true)}
                style={{ marginLeft: "20px" }}
                shadow
                iconRight={<MoreHorizontal />}
                auto
                scale={1 / 3}
              />
            )}
          </Radio.Group>
        </Modal.Content>
        <Modal.Action passive onClick={() => setModalVisible(false)}>
          取消
        </Modal.Action>
        <Modal.Action onClick={() => doTranscode()}>确认</Modal.Action>
      </Modal>

      <Modal visible={audioModalVisible}>
        <Modal.Title>提取音频</Modal.Title>
        <Modal.Subtitle>请选择音频格式</Modal.Subtitle>
        <Modal.Content>
          <Radio.Group
            value={audioType}
            onChange={(val) => setAudioType(val)}
            useRow={!more}
          >
            {audioTypeList
              .slice(0, more ? audioTypeList.length : 3)
              .map((type) => (
                <Radio key={type} value={type}>
                  {type}
                </Radio>
              ))}
            {!more && (
              <Button
                onClick={() => setMore(true)}
                style={{ marginLeft: "20px" }}
                shadow
                iconRight={<MoreHorizontal />}
                auto
                scale={1 / 3}
              />
            )}
          </Radio.Group>
        </Modal.Content>
        <Modal.Action passive onClick={() => setAudioModalVisible(false)}>
          取消
        </Modal.Action>
        <Modal.Action onClick={() => getAudio()}>确认</Modal.Action>
      </Modal>
      <input
              ref={inputFileEl}
              onChange={onChange}
              style={{display:'none'}}
              accept="video/*"
              type="file"
              className="App-main-upload"
            />
      <main className="App-main">
        {file ? (
          <div className="App-main-content">
            <Display caption={file.name} shadow>
              <div className="App-main-actions">
                {actions.map((item) => (
                  <Button
                    key={item.value}
                    className="App-main-content-button"
                    onClick={() => action(item.value)}
                    shadow
                    type={item.value<0?'abort':'secondary'}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </Display>
          </div>
        ) : (
          <>
            <div className="App-main-info">点击上传视频</div>
            <input
              onChange={onChange}
              accept="video/*"
              type="file"
              className="App-main-upload"
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;

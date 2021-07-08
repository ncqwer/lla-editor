import {
  LLAEnvironment,
  LLAEditor,
  SharedProvider,
  createInitialValue,
} from '@lla-editor/editor';
import { LiveProvider, LiveEditor, LivePreview, LiveError } from 'react-live';
import theme from 'prism-react-renderer/themes/oceanicNext';

const scope = { LLAEnvironment, LLAEditor, SharedProvider, createInitialValue };

const hh = () => {
  return (
    <div id="root" className="flex">
      <LiveProvider scope={scope} code={code} noInline={true} theme={theme}>
        <div className="w-0 xl:w-1/2 2xl:w-1/3  h-screen overflow-auto">
          <LiveEditor></LiveEditor>
        </div>
        <div className="contents">
          <LivePreview className="live-preview flex-grow p-4 bg-gray-50 h-screen overflow-auto"></LivePreview>
          <LiveError className="flex-grow text-red-600"></LiveError>
        </div>
      </LiveProvider>
    </div>
  );
};

export default hh;

const code = `// import {
//   LLAEnvironment,
//   LLAEditor,
//   SharedProvider,
//   createInitialValue,
// } from '@lla-editor/editor';
const Example = () => {
  const imageRef = React.useRef(null);
  const audioRef = React.useRef(null);
  const videoRef = React.useRef(null);
  const promiseRef = React.useRef(null);
  const [value, setValue] = React.useState(createInitialValue());
  return (
    <LLAEnvironment>
      <SharedProvider
        initialValue={React.useMemo(
          () => ({
            indentContainer: {
              indent: 24,
            },
            image: {
              loadingCover: 'loadingCover',
              errorCover: 'errorCover',
              imgOpen: async () => {
                if (promiseRef.current) promiseRef.current[1]();
                imageRef.current.click();
                return new Promise((res, rej) => {
                  promiseRef.current = [res, rej];
                });
              },
              imgSign: async (id) => id,
              imgRemove: async (id) => console.log(id),
            },
            audio: {
              loadingCover: 'loadingCover',
              errorCover: 'errorCover',
              audioOpen: async () => {
                if (promiseRef.current) promiseRef.current[1]();
                audioRef.current.click();
                return new Promise((res, rej) => {
                  promiseRef.current = [res, rej];
                });
              },
              audioSign: async (id) => id,
              audioRemove: async (id) => console.log(id),
            },
            video: {
              loadingCover: 'loadingCover',
              errorCover: 'errorCover',
              videoOpen: async () => {
                if (promiseRef.current) promiseRef.current[1]();
                videoRef.current.click();
                return new Promise((res, rej) => {
                  promiseRef.current = [res, rej];
                });
              },
              videoSign: async (id) => id,
              videoRemove: async (id) => console.log(id),
            },
          }),
          [],
        )}
      >
        <LLAEditor value={value} onChange={setValue}></LLAEditor>
        <input
          type="file"
          className="hidden"
          ref={imageRef}
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            new Promise((res) => {
              reader.onload = (event) => {
                if (event.target) return res(event.target.result);
                return res(null);
              };
              reader.readAsDataURL(file);
            }).then(dataURL=>{
              dataURL && promiseRef.current && promiseRef.current[0](dataURL);
            });
          }}
          accept=".jpeg,.jpg,.png"
        />
        <input
          type="file"
          className="hidden"
          ref={audioRef}
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            new Promise((res) => {
              reader.onload = (event) => {
                if (event.target) return res(event.target.result);
                return res(null);
              };
              reader.readAsDataURL(file);
            }).then(dataURL=>{
              dataURL && promiseRef.current && promiseRef.current[0](dataURL);
            });
          }}
          accept=".mp3"
        />
        <input
          type="file"
          className="hidden"
          ref={videoRef}
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            new Promise((res) => {
              reader.onload = (event) => {
                if (event.target) return res(event.target.result);
                return res(null);
              };
              reader.readAsDataURL(file);
            }).then(dataURL=>{
              dataURL && promiseRef.current && promiseRef.current[0](dataURL);
            });
          }}
          accept=".mp4"
        />
      </SharedProvider>
    </LLAEnvironment>
  );
};

render(<Example></Example>)
`;

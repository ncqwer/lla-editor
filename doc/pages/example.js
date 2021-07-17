import React from 'react';
import {
  LLAEnvironment,
  LLAEditor,
  SharedProvider,
  createInitialValue,
} from '@lla-editor/editor';
import { LiveProvider, LiveEditor, LivePreview, LiveError } from 'react-live';
import theme from 'prism-react-renderer/themes/oceanicNext';

import unified from 'unified';
import parse from 'rehype-parse';
import rehype2remark from 'rehype-remark';
import remarkParse from 'remark-parse';
import stringify from 'remark-stringify';

const scope = {
  LLAEnvironment,
  LLAEditor,
  SharedProvider,
  createInitialValue,
  unified,
  parse,
  rehype2remark,
  remarkParse,
  stringify,
};

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

const code = `// import {
//   LLAEnvironment,
//   LLAEditor,
//   SharedProvider,
//   createInitialValue,
// } from '@lla-editor/editor';
// import unified from 'unified';
// import parse from 'rehype-parse';
// import rehype2remark from 'rehype-remark';
// import remarkParse from 'remark-parse';
// import stringify from 'remark-stringify';

const processor = unified().use(parse).use(rehype2remark);
const txtprocessor = unified().use(remarkParse);
const mdprocessor = unified().use(stringify, {
  bullet: '*',
  fence: '~',
  fences: true,
  incrementListMarker: false,
});

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
            core: {
              html2md: (v) => {
                const node = processor.parse(v);
                const ast = processor.runSync(node);
                console.log(ast);
                return ast;
              },
              txt2md: (v) => {
                return txtprocessor.parse(v);
              },
              md2txt: (ast) => {
                return mdprocessor.stringify(ast);
              },
              overlayerId: 'root',
            },
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
            promiseRef.current && promiseRef.current[0](file);
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
            promiseRef.current && promiseRef.current[0](file);
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
            promiseRef.current && promiseRef.current[0](file);
          }}
          accept=".mp4"
        />
      </SharedProvider>
    </LLAEnvironment>
  );
};

render(<Example></Example>)
`;

// const processor = unified().use(parse).use(rehype2remark);
// const txtprocessor = unified().use(remarkParse);
// const mdprocessor = unified().use(stringify, {
//   bullet: '*',
//   fence: '~',
//   fences: true,
//   incrementListMarker: false,
// });
// const hhh = () => {
//   const imageRef = React.useRef(null);
//   const audioRef = React.useRef(null);
//   const videoRef = React.useRef(null);
//   const promiseRef = React.useRef(null);
//   const [value, setValue] = React.useState(createInitialValue());
//   return (
//     <div id="root">
//       <LLAEnvironment>
//         <SharedProvider
//           initialValue={React.useMemo(
//             () => ({
//               core: {
//                 html2md: (v) => {
//                   try {
//                     const node = processor.parse(v);
//                     const ast = processor.runSync(node);
//                     console.log(ast);
//                     return ast;
//                   } catch (e) {
//                     console.log(e);
//                   }
//                 },
//                 txt2md: (v) => {
//                   return txtprocessor.parse(v);
//                 },
//                 md2txt: (ast) => {
//                   return mdprocessor.stringify(ast);
//                 },
//                 overlayerId: 'root',
//               },
//               indentContainer: {
//                 indent: 24,
//               },
//               image: {
//                 loadingCover: 'loadingCover',
//                 errorCover: 'errorCover',
//                 imgOpen: async () => {
//                   if (promiseRef.current) promiseRef.current[1]();
//                   imageRef.current.click();
//                   return new Promise((res, rej) => {
//                     promiseRef.current = [res, rej];
//                   });
//                 },
//                 imgSign: async (id) => id,
//                 imgRemove: async (id) => console.log(id),
//               },
//               audio: {
//                 loadingCover: 'loadingCover',
//                 errorCover: 'errorCover',
//                 audioOpen: async () => {
//                   if (promiseRef.current) promiseRef.current[1]();
//                   audioRef.current.click();
//                   return new Promise((res, rej) => {
//                     promiseRef.current = [res, rej];
//                   });
//                 },
//                 audioSign: async (id) => id,
//                 audioRemove: async (id) => console.log(id),
//               },
//               video: {
//                 loadingCover: 'loadingCover',
//                 errorCover: 'errorCover',
//                 videoOpen: async () => {
//                   if (promiseRef.current) promiseRef.current[1]();
//                   videoRef.current.click();
//                   return new Promise((res, rej) => {
//                     promiseRef.current = [res, rej];
//                   });
//                 },
//                 videoSign: async (id) => id,
//                 videoRemove: async (id) => console.log(id),
//               },
//             }),
//             [],
//           )}
//         >
//           <LLAEditor value={value} onChange={setValue}></LLAEditor>
//           <input
//             type="file"
//             className="hidden"
//             ref={imageRef}
//             onChange={(e) => {
//               const file = e.target.files[0];
//               if (!file) return;
//               promiseRef.current && promiseRef.current[0](file);
//             }}
//             accept=".jpeg,.jpg,.png"
//           />
//           <input
//             type="file"
//             className="hidden"
//             ref={audioRef}
//             onChange={(e) => {
//               const file = e.target.files[0];
//               if (!file) return;
//               promiseRef.current && promiseRef.current[0](file);
//             }}
//             accept=".mp3"
//           />
//           <input
//             type="file"
//             className="hidden"
//             ref={videoRef}
//             onChange={(e) => {
//               const file = e.target.files[0];
//               if (!file) return;
//               promiseRef.current && promiseRef.current[0](file);
//             }}
//             accept=".mp4"
//           />
//         </SharedProvider>
//       </LLAEnvironment>
//     </div>
//   );
// };

export default hh;

import React from 'react';
import { cx, css } from '@emotion/css';
import router, { useRouter } from 'next/router';
import '../style/index.css';

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  const pathname = router;
  React.useState(() => {
    setIsOpen(false);
  }, [pathname]);
  if (router.pathname === '/example') return <Component {...pageProps} />;
  return (
    <div className="w-screen h-screen">
      <header
        className={cx(
          'sticky top-0',
          css`
            box-shadow: 0 3px 8px 0 rgb(116 129 141 / 10%);
            border-bottom: 1px solid #d4dadf;
          `,
        )}
      >
        <div
          className={cx(
            'w-full flex items-center',
            css`
              max-width: 1448px;
              margin: 0 auto;
              // padding: 0 1rem;
              height: 80px;
            `,
          )}
        >
          <div
            className={cx(
              'lg:pl-4 lg:mr-8 relative flex items-center  flex-grow lg:flex-grow-0 justify-center lg:justify-start',
              css`
                @media (min-width: 1024px) {
                  min-width: 296px;

                  &::after {
                    top: 50%;
                    content: '';
                    right: 0;
                    height: 40px;
                    position: absolute;
                    transform: translateY(-50%);
                    border-left: 1px solid #e6ecf1;
                  }
                }
              `,
            )}
          >
            <div
              className={cx(
                'lg:hidden flex cursor-pointer m-0 outline-none p-0 text-lg items-center justify-center absolute hover:bg-gray-100 active:bg-gray-200',
                css`
                  width: 30px;
                  height: 30px;
                  left: 0;
                  top: 50%;
                  transform: translate(50%, -50%);
                `,
              )}
              onClick={() => setIsOpen(true)}
            >
              <svg
                preserveAspectRatio="xMidYMid meet"
                height="1em"
                width="1em"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                stroke="currentColor"
                className={cx(
                  'w-4 h-4 align-middle',
                  css`
                    color: #242a31;
                  `,
                )}
              >
                <g>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </g>
              </svg>
            </div>
            <div className="flex items-center ">
              <div className="w-10 h-10 font-mono rounded bg-gray-300 flex items-center justify-center text-gray-400">
                L
              </div>
              <div
                className={cx(
                  'ml-4 font-bold text-2xl font-mono text-gray-700',
                )}
              >
                LLA
              </div>
            </div>
          </div>
          <nav
            className={cx(
              'hidden lg:flex items-center text-blue-400  font-medium',
              css`
                & > a {
                  margin-right: 3rem;
                }
              `,
            )}
          >
            <a href="/example">Example</a>
            <a href="https://www.github.com">GitHub</a>
          </nav>
        </div>
      </header>
      <div
        className={cx(
          'flex relative',
          css`
            height: calc(100vh - 81px);
          `,
        )}
      >
        {isOpen && (
          <div
            className={`z-10 fixed lg:absolute  inset-0 bg-gray-500 bg-opacity-75  transition-opacity ease-in-out duration-500 ${
              isOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => {
              setIsOpen(false);
            }}
          ></div>
        )}
        <div
          className={cx(
            'w-0  lg:relative lg:block  lg:bg-gray-50 z-20',
            css`
              @media (min-width: 1024px) {
                padding-left: calc((100vw - 1448px) / 2);
                width: calc((100vw - 1448px) / 2 + 297px);
              }
            `,
          )}
        >
          <div
            className={cx(
              ` z-20 fixed lg:relative left-0 top-0 w-full h-screen lg:h-full transform transition ease-in-out duration-500 sm:duration-700 bg-gray-50 ${
                isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
              } text-gray-700 font-semibold`,
              css`
                width: 297px;
                border-right: 1px solid #eee;
              `,
            )}
          >
            <div
              className={cx(
                'p-4 pr-6 ml-6 ',
                css`
                  border-bottom: 1px solid #eee;
                `,
              )}
            >
              Doc
            </div>
            <SidebarItem
              to="/"
              className={cx(
                'mt-4 mb-4 ml-2',
                css`
                  margin-left: 0.5rem;
                `,
              )}
            >
              关于LLA
            </SidebarItem>
            <SidebarItem
              to="/installation"
              className={cx(
                'mt-4 mb-4 ml-2',
                css`
                  margin-left: 0.5rem;
                `,
              )}
            >
              安装
            </SidebarItem>
            <div className="mt-4 mb-4">
              <div className="pt-2 pb-2 pl-6 pr-6 ml-2 font-normal font-serif pointer-events-none">
                现有插件
              </div>
              <SidebarItem to="/audio">audio</SidebarItem>
              <SidebarItem to="/callout">callout</SidebarItem>
              <SidebarItem to="/divider">divider</SidebarItem>
              <SidebarItem to="/heading">heading</SidebarItem>
              <SidebarItem to="/image">image</SidebarItem>
              <SidebarItem to="/indent">indent</SidebarItem>
              <SidebarItem to="/list">list</SidebarItem>
              <SidebarItem to="/quote">quote</SidebarItem>
              <SidebarItem to="/textblock">text_block</SidebarItem>
            </div>
            <div className="mt-4 mb-4">
              <div className="pt-2 pb-2 pl-6 pr-6 ml-2 font-normal font-serif pointer-events-none">
                插件开发
              </div>
              <SidebarItem to="/withEditor">拓展Editor</SidebarItem>
              <SidebarItem to="/onKeyDown">处理键盘事件</SidebarItem>
              <SidebarItem to="/render">自定义渲染</SidebarItem>
              <SidebarItem to="/insertInfo">
                集成插入下拉框和悬浮菜单
              </SidebarItem>
              <SidebarItem to="/config">插件配置</SidebarItem>
              <SidebarItem to="/typescript">TS支持</SidebarItem>
              <SidebarItem to="/paragraph">基础段落</SidebarItem>
            </div>
          </div>
        </div>
        <div className="flex-grow overflow-auto bg-white">
          <article
            className={cx(
              ' xl:prose-lg prose pt-10 overflow-auto  bg-white flex-grow',
              css`
                width: 100%;
                max-width: 768px;
                min-height: calc(100% - 2px);
                padding: 2.5rem 2rem;
                margin: 0 auto;
                @media (min-width: 1024px) {
                  margin: 0 88px;
                }
                @media (min-width: 640px) {
                  padding: 2.5rem auto;
                }
              `,
            )}
          >
            <Component {...pageProps} />
          </article>
        </div>
      </div>
    </div>
  );
}

const SidebarItem = ({ to, className, ...others }) => {
  const router = useRouter();
  const { pathname } = router;
  const active = React.useMemo(() => to === pathname, [to, pathname]);
  return (
    <div
      className={cx(
        'pt-2 pb-2 pl-6 pr-6 ml-4 cursor-pointer hover:bg-gray-100 active:bg-gray-200',
        active && 'active bg-white text-blue-600',
        css`
          &.active {
            border: 1px solid #eee;
            border-right-width: 0;
          }
        `,
        className,
      )}
      onClick={() => {
        router.push(to);
      }}
      {...others}
    ></div>
  );
};

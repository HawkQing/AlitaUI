import { MuiMarkdown, getOverrides } from 'mui-markdown';
import styled from '@emotion/styled';
import Link from '@mui/material/Link';
import { marked } from 'marked'
import { Highlight, themes } from 'prism-react-renderer';

const MarkdownMapping = {
  h1: {
    component: 'h1',
    props: {
    },
  },
  h2: {
    component: 'h2',
    props: {
    },
  },
  h3: {
    component: 'h3',
    props: {
    },
  },
  h4: {
    component: 'h4',
    props: {
    },
  },
  h5: {
    component: 'h5',
    props: {
    },
  },
  h6: {
    component: 'h6',
    props: {
    },
  },
  p: {
    component: 'p',
    props: {
      style: { marginBlockStart: '0px' }
    },
  },
  span: {
    component: 'span',
    props: {
    },
  },
  a: {
    component: Link,
    props: {
      target: '_blank'
    },
  },
  li: {
    component: 'li',
    props: {
    },
  },
}

const StyledDiv = styled('div')(() => `
  background: transparent;
`);

const Markdown = ({ children }) => {
  const markedTokens = marked.lexer(children || '')
  return markedTokens.map(
    (markedToken, index) => markedToken.type === 'code' ? <Highlight
      key={index}
      theme={themes.vsDark}
      code={markedToken.text}
      language={markedToken.lang}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={className} style={style}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              <span>{' '}</span>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
      :
      <MuiMarkdown
        key={index}
        overrides={{
          ...getOverrides(),
          ...MarkdownMapping,
          div: {
            component: StyledDiv,
            props: {},
          },
        }}>
        {markedToken.raw}
      </MuiMarkdown>
  )
};

export default Markdown;
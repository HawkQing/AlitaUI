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
  const tokens = marked.lexer(children || '')
  return tokens.map(
    (token, index) => <MuiMarkdown
        key={index}
        Highlight={Highlight}
        themes={themes}
        overrides={{
          ...getOverrides({ Highlight, themes, theme: themes.vsDark, hideLineNumbers: true }),
          ...MarkdownMapping,
          div: {
            component: StyledDiv,
            props: {},
          },
        }}>
        {token.raw}
      </MuiMarkdown>
  )
};

export default Markdown;
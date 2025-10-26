'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';

// Component to render AI response with full markdown support
export default function ResponseRenderer({ response, darkMode }) {
  if (!response) {
    return <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>Response will appear here...</span>;
  }

  // Check if response contains image data
  // Claude API returns images as base64 in content blocks
  if (typeof response === 'object' && response.type === 'image') {
    return (
      <div className="space-y-2">
        <img
          src={response.source?.type === 'base64' ? `data:${response.source.media_type};base64,${response.source.data}` : response.url}
          alt="AI generated content"
          className="max-w-full h-auto rounded-lg"
        />
      </div>
    );
  }

  // Check if response is an array (mixed content with text and images)
  if (Array.isArray(response)) {
    return (
      <div className="space-y-3">
        {response.map((item, index) => {
          if (item.type === 'text') {
            return (
              <div key={index} className="markdown-content" style={{ lineHeight: '0.9' }}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex, rehypeRaw]}
                  components={{
                  // Style line breaks to be very compact
                  br: ({node, ...props}) => (
                    <br style={{ lineHeight: '0.1', fontSize: '1px', margin: 0, padding: 0 }} {...props} />
                  ),
                  // Style tables - compact
                  table: ({node, ...props}) => (
                    <div className="overflow-x-auto my-1">
                      <table className={`min-w-full border-collapse text-xs ${darkMode ? 'border-gray-600' : 'border-gray-300'}`} {...props} />
                    </div>
                  ),
                  thead: ({node, ...props}) => (
                    <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-100'} {...props} />
                  ),
                  th: ({node, ...props}) => (
                    <th className={`border px-1 py-0.5 text-left font-semibold ${darkMode ? 'border-gray-600' : 'border-gray-300'}`} {...props} />
                  ),
                  td: ({node, ...props}) => (
                    <td className={`border px-1 py-0.5 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`} {...props} />
                  ),
                  // Style code blocks - compact
                  code: ({node, inline, ...props}) => (
                    inline
                      ? <code className={`px-0.5 rounded text-xs ${darkMode ? 'bg-gray-700 text-blue-300' : 'bg-gray-200 text-blue-700'}`} style={{ lineHeight: '0.9' }} {...props} />
                      : <code className={`block p-1 rounded my-0 overflow-x-auto text-xs ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`} style={{ lineHeight: '0.9' }} {...props} />
                  ),
                  pre: ({node, ...props}) => (
                    <pre className="my-0" style={{ lineHeight: '0.9' }} {...props} />
                  ),
                  // Style links - compact
                  a: ({node, ...props}) => (
                    <a className={`underline ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`} target="_blank" rel="noopener noreferrer" {...props} />
                  ),
                  // Style lists - ultra compact
                  ul: ({node, ...props}) => (
                    <ul className="list-disc list-inside my-0 space-y-0" style={{ lineHeight: '0.9' }} {...props} />
                  ),
                  ol: ({node, ...props}) => (
                    <ol className="list-decimal list-inside my-0 space-y-0" style={{ lineHeight: '0.9' }} {...props} />
                  ),
                  // Style headings - ultra compact
                  h1: ({node, ...props}) => (
                    <h1 className="text-base font-bold my-0" style={{ lineHeight: '0.9' }} {...props} />
                  ),
                  h2: ({node, ...props}) => (
                    <h2 className="text-sm font-bold my-0" style={{ lineHeight: '0.9' }} {...props} />
                  ),
                  h3: ({node, ...props}) => (
                    <h3 className="text-sm font-bold my-0" style={{ lineHeight: '0.9' }} {...props} />
                  ),
                  // Style blockquotes - compact
                  blockquote: ({node, ...props}) => (
                    <blockquote className={`border-l-2 pl-2 my-0.5 italic text-xs ${darkMode ? 'border-gray-600 text-gray-400' : 'border-gray-400 text-gray-600'}`} {...props} />
                  ),
                  // Style paragraphs - ultra compact
                  p: ({node, ...props}) => (
                    <p className="my-0" style={{ lineHeight: '0.9' }} {...props} />
                  ),
                  }}
                >
                  {item.text}
                </ReactMarkdown>
              </div>
            );
          } else if (item.type === 'image') {
            return (
              <img
                key={index}
                src={item.source?.type === 'base64' ? `data:${item.source.media_type};base64,${item.source.data}` : item.url}
                alt="AI generated content"
                className="max-w-full h-auto rounded-lg border border-gray-600"
              />
            );
          }
          return null;
        })}
      </div>
    );
  }

  // Regular text response - render as markdown
  return (
    <div className="markdown-content" style={{ lineHeight: '0.9' }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
        // Style line breaks to be very compact
        br: ({node, ...props}) => (
          <br style={{ lineHeight: '0.1', fontSize: '1px', margin: 0, padding: 0 }} {...props} />
        ),
        // Style tables - compact
        table: ({node, ...props}) => (
          <div className="overflow-x-auto my-1">
            <table className={`min-w-full border-collapse text-xs ${darkMode ? 'border-gray-600' : 'border-gray-300'}`} {...props} />
          </div>
        ),
        thead: ({node, ...props}) => (
          <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-100'} {...props} />
        ),
        th: ({node, ...props}) => (
          <th className={`border px-1 py-0.5 text-left font-semibold ${darkMode ? 'border-gray-600' : 'border-gray-300'}`} {...props} />
        ),
        td: ({node, ...props}) => (
          <td className={`border px-1 py-0.5 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`} {...props} />
        ),
        tbody: ({node, ...props}) => (
          <tbody className={darkMode ? 'divide-gray-700' : 'divide-gray-200'} {...props} />
        ),
        tr: ({node, ...props}) => (
          <tr className={darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'} {...props} />
        ),
        // Style code blocks - compact
        code: ({node, inline, ...props}) => (
          inline
            ? <code className={`px-0.5 rounded font-mono text-xs ${darkMode ? 'bg-gray-700 text-blue-300' : 'bg-gray-200 text-blue-700'}`} style={{ lineHeight: '0.9' }} {...props} />
            : <code className={`block p-1 rounded my-0 overflow-x-auto font-mono text-xs ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`} style={{ lineHeight: '0.9' }} {...props} />
        ),
        pre: ({node, ...props}) => (
          <pre className="my-0 rounded" style={{ lineHeight: '0.9' }} {...props} />
        ),
        // Style links - compact
        a: ({node, ...props}) => (
          <a className={`underline ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`} target="_blank" rel="noopener noreferrer" {...props} />
        ),
        // Style lists - ultra compact
        ul: ({node, ...props}) => (
          <ul className="list-disc list-inside my-0 space-y-0" style={{ lineHeight: '0.9' }} {...props} />
        ),
        ol: ({node, ...props}) => (
          <ol className="list-decimal list-inside my-0 space-y-0" style={{ lineHeight: '0.9' }} {...props} />
        ),
        li: ({node, ...props}) => (
          <li className="ml-2" style={{ lineHeight: '0.9' }} {...props} />
        ),
        // Style headings - ultra compact
        h1: ({node, ...props}) => (
          <h1 className="text-base font-bold my-0" style={{ lineHeight: '0.9' }} {...props} />
        ),
        h2: ({node, ...props}) => (
          <h2 className="text-sm font-bold my-0" style={{ lineHeight: '0.9' }} {...props} />
        ),
        h3: ({node, ...props}) => (
          <h3 className="text-sm font-bold my-0" style={{ lineHeight: '0.9' }} {...props} />
        ),
        h4: ({node, ...props}) => (
          <h4 className="text-xs font-bold my-0" style={{ lineHeight: '0.9' }} {...props} />
        ),
        h5: ({node, ...props}) => (
          <h5 className="text-xs font-bold my-0" style={{ lineHeight: '0.9' }} {...props} />
        ),
        h6: ({node, ...props}) => (
          <h6 className="text-xs font-bold my-0" style={{ lineHeight: '0.9' }} {...props} />
        ),
        // Style blockquotes - compact
        blockquote: ({node, ...props}) => (
          <blockquote className={`border-l-2 pl-2 my-0.5 italic text-xs ${darkMode ? 'border-gray-600 text-gray-400' : 'border-gray-400 text-gray-600'}`} {...props} />
        ),
        // Style paragraphs - ultra compact
        p: ({node, ...props}) => (
          <p className="my-0" style={{ lineHeight: '0.9' }} {...props} />
        ),
        // Style images - compact
        img: ({node, ...props}) => (
          <img className="max-w-full h-auto rounded-lg my-1" {...props} />
        ),
        // Style horizontal rules - compact
        hr: ({node, ...props}) => (
          <hr className={`my-1 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`} {...props} />
        ),
        }}
      >
        {response}
      </ReactMarkdown>
    </div>
  );
}

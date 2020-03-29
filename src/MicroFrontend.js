import React, { useEffect } from 'react';

const MicroFrontend = ({ name, host, history }) => {
  useEffect(() => {
    const scriptId = `micro-frontend-script-${name}`;
    const renderMicroFrontend = () => {
      window[`render${name}`] && window[`render${name}`](`${name}-container`, history);
    };

    if (document.getElementById(scriptId)) {
      renderMicroFrontend();
      return;
    }

    fetch(`${host}/asset-manifest.json`)
      .then(res => res.json())
      .then(manifest => {
        let chunkCount = -1;
        Object.keys(manifest['files'])
          .filter(key => key.endsWith('.js'))
          .forEach((key, _, arr) => {
            if (chunkCount < 0) {
              chunkCount = arr.length;
            }
            const path = `${host}${manifest['files'][key]}`;
            const script = document.createElement('script');
            if (key === 'main.js') {
              script.id = scriptId;
            }
            script.onload = () => {
              chunkCount--;
              if (chunkCount === 0) {
                renderMicroFrontend();
              }
            }
            script.src = path;
            document.head.appendChild(script);
          });
      });

    return () => {
      window[`unmount${name}`] && window[`unmount${name}`](`${name}-container`);
    };
  }, [name, host, history]);

  return <main id={`${name}-container`} />;
}

export default MicroFrontend;

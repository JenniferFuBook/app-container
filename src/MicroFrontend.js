import React from 'react';

class MicroFrontend extends React.Component {
  componentDidMount() {
    const { name, host, document } = this.props;
    const scriptId = `micro-frontend-script-${name}`;

    if (document.getElementById(scriptId)) {
      this.renderMicroFrontend();
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
                this.renderMicroFrontend();
              }
            }
            script.src = path;
            document.head.appendChild(script);
          });
      });
  }

  componentWillUnmount() {
    const { name, window } = this.props;

    window[`unmount${name}`] && window[`unmount${name}`](`${name}-container`);
  }

  renderMicroFrontend = () => {
    const { name, window, history } = this.props;

    window[`render${name}`] &&
      window[`render${name}`](`${name}-container`, history);
  };

  render() {
    return <main id={`${this.props.name}-container`} />;
  }
}

MicroFrontend.defaultProps = {
  document,
  window
};

export default MicroFrontend;

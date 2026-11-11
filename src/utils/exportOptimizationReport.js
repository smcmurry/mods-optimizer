export default function prepareOptimizationReport(allyCode, names, onProgress = () => {}) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(`${process.env.PUBLIC_URL || ''}/workers/exportOptimizationReport.js`);
    let timer;
    const finish = (error, result) => {
      clearTimeout(timer);
      worker.terminate();
      if (error) reject(error);
      else resolve(result);
    };
    const resetTimeout = () => {
      clearTimeout(timer);
      timer = setTimeout(() => finish(new Error('Export stopped responding. Reload the app and try again.')), 120000);
    };
    worker.onmessage = ({ data }) => {
      resetTimeout();
      if (data.type === 'progress') onProgress(data.message);
      else if (data.type === 'complete') finish(null, data);
      else if (data.type === 'error') finish(new Error(data.message));
    };
    worker.onerror = event => finish(new Error(event.message || 'The report export worker could not start. Reload the app and try again.'));
    worker.onmessageerror = () => finish(new Error('The report download could not be transferred. Try exporting again.'));
    resetTimeout();
    try {
      worker.postMessage({ allyCode, names });
    } catch (error) {
      finish(error);
    }
  });
}

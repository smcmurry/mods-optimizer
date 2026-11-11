import React from 'react';

// Keep progress local: updating the export must not recalculate the review list.
export default class ExportRunReport extends React.PureComponent {
  state = { exporting: false, progress: '' };
  mounted = false;

  componentDidMount() { this.mounted = true; }
  componentWillUnmount() { this.mounted = false; }

  export = async () => {
    if (this.state.exporting) return;
    this.setState({ exporting: true, progress: 'Loading saved report…' });
    try {
      await this.props.onExport(progress => {
        if (this.mounted) this.setState({ progress });
      });
    } catch (error) {
      // The export action displays the error using the app's existing dialog.
    } finally {
      if (this.mounted) this.setState({ exporting: false, progress: '' });
    }
  };

  render() {
    return <span>
      <button type="button" className="small" onClick={this.export} disabled={this.state.exporting}>
        {this.state.exporting ? 'Exporting…' : 'Export Run Report'}
      </button>{' '}
      <small role="status" aria-live="polite">{this.state.progress}</small>
    </span>;
  }
}

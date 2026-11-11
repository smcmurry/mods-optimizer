import React from 'react';

export default class GenerateCharacterPicker extends React.PureComponent {
  state = {enabled:false,query:'',ids:this.props.characters.map(character => character.baseID)};
  change = (next) => this.setState(next, () => this.props.onChange(this.state.enabled ? this.state.ids : null));
  render() {
    const {enabled,query,ids} = this.state;
    const name = character => (this.props.gameSettings[character.baseID] || {}).name || character.baseID;
    const matches = this.props.characters.filter(character => name(character).toLowerCase().includes(query.toLowerCase()))
      .sort((a,b) => name(a).localeCompare(name(b)));
    return <fieldset>
      <legend>Characters to include</legend>
      <label><input type="checkbox" checked={enabled} onChange={event => this.change({enabled:event.target.checked})} /> Choose specific characters</label>
      {enabled && <React.Fragment>
        <p>Only checked characters will be added, in the chosen ranking order. Other generation settings still apply.
          Append keeps characters already in your list; use Overwrite to replace it.</p>
        <label>Search characters <input type="search" value={query} onChange={event => this.setState({query:event.target.value})} /></label>
        <div>
          <button type="button" onClick={() => this.change({ids:this.props.characters.map(character=>character.baseID)})}>Select all</button>
          <button type="button" onClick={() => this.change({ids:[]})}>Clear selection</button>
          <button type="button" onClick={() => this.change({ids:this.props.characters.filter(character=>this.props.selectedIDs.includes(character.baseID)).map(character=>character.baseID)})}>Use current list</button>
        </div>
        <p role="status">{ids.length} characters selected · {matches.length} shown</p>
        <div style={{maxHeight:'300px',overflowY:'auto',textAlign:'left'}}>
          {matches.map(character => <label key={character.baseID} style={{display:'block'}}>
            <input type="checkbox" checked={ids.includes(character.baseID)} onChange={event => this.change({ids:event.target.checked ? ids.concat(character.baseID) : ids.filter(id=>id!==character.baseID)})} />
            {name(character)} · Gear {character.playerValues.gearLevel}
          </label>)}
          {!matches.length && <p>No characters match your search.</p>}
        </div>
      </React.Fragment>}
    </fieldset>;
  }
}

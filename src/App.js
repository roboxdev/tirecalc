import React, { Component } from 'react';
import fromPairs from 'lodash/fromPairs';
import uniq from 'lodash/uniq';
import groupBy from 'lodash/groupBy';
import styled from 'styled-components';
import cartesian from './utils/cartesian';
import {
  oneKmInMm,
  WIDTH_OPTIONS,
  HEIGHT_OPTIONS,
  DIAMETER_OPTIONS,
  TABLE_DISPLAY_OPTIONS,
  COLORS,
} from './constants';
import './App.css';

const DiffCell = ({ data: {diffScore, diff, diffPercent} = {} }) => (
  <CellStyled diffScore={diffScore}>
    {diff.toFixed(2)} ({ Math.abs(diffPercent.toFixed())}%)
    </CellStyled>
);

const RideHeightDiffCell = ({ data: {diffScore, rideHeightDiff} = {} }) => (
  <CellStyled diffScore={diffScore}>
    {rideHeightDiff.toFixed()}
    </CellStyled>
);

class App extends Component {
  state = {
    referenceWidth: 185,
    referenceHeight: 75,
    referenceDiameter: 16,
    newDiameter: 16,

    minWidthIndex: 0,
    maxWidthIndex: WIDTH_OPTIONS.length - 1,

    table: {},
    tableDisplay: 'diff',
  };

  componentDidMount() {
    this.refreshTable();
  };

  calculate = ({ width, height, diameter }) => {
    const rimDiameter = diameter * 25.4;
    const tireHeight = width * height / 100;
    const tireDiameter = tireHeight * 2 + rimDiameter;
    const circumference = tireDiameter * Math.PI;
    const revsPerKm = oneKmInMm / circumference;
    return {
      width,
      height,
      diameter,
      rimDiameter,
      tireHeight,
      circumference,
      tireDiameter,
      revsPerKm,
    };
  };

  getReference = () => {
    const { referenceWidth, referenceHeight, referenceDiameter } = this.state;
    return this.calculate({ width: referenceWidth, height: referenceHeight, diameter: referenceDiameter });
  };

  refreshTable = () => {
    const { minWidthIndex, maxWidthIndex } = this.state;
    const reference = this.getReference();
    const SELECTED_WIDTH_OPTIONS = WIDTH_OPTIONS.slice(minWidthIndex, maxWidthIndex + 1);
    const product = cartesian(SELECTED_WIDTH_OPTIONS, HEIGHT_OPTIONS, DIAMETER_OPTIONS);
    const table = fromPairs(product.map(([width, height, diameter]) => {
      const {
        rimDiameter,
        tireHeight,
        circumference,
        tireDiameter,
        revsPerKm,
      } = this.calculate({ width, height, diameter });
      const diff = tireDiameter - reference.tireDiameter;
      const diffPercent = (1 - tireDiameter / reference.tireDiameter) * 100;
      const rideHeightDiff = diff / 2;
      const diffScore = Math.abs(diffPercent.toFixed());
      const key = `${width}/${height}/R${diameter}`;
      return [
        key,
        {
          key,
          width,
          height,
          diameter,
          rimDiameter,
          tireHeight,
          circumference,
          tireDiameter,
          revsPerKm,
          diff,
          diffPercent,
          rideHeightDiff,
          diffScore,
        }];
    }));
    this.setState({ table });
  };

  getList = () => {
    const { table, newDiameter } = this.state;
    const a = groupBy(Object.values(table).filter(({ diameter, diffScore }) => newDiameter === diameter && diffScore <= 3), ({ diffScore }) => Math.max(diffScore, 1));
    console.log(a);
    return a;
  };

  getGoodDiameters = () => uniq(Object.values(this.state.table).filter(({ diffScore }) => diffScore <= 3).map(({ diameter }) => diameter)).sort();

  handleChange = e => {
    const { name, value } = e.target;
    this.setState({[name]: value});
  };

  handleReferenceChange = e => {
    const { name, value } = e.target;
    this.setState(
      {
        [name]: value,
      },
      this.refreshTable
    );
  };

  handleDiameterChange = e => {
    const { name, value } = e.target;
    this.setState(
      {
        [name]: value,
        newDiameter: value,
      },
      this.refreshTable
    );
  };

  render() {
    const { referenceWidth, referenceHeight, referenceDiameter, newDiameter, table, tableDisplay } = this.state;
    const cellMapping = {
      diff: DiffCell,
      rideHeightDiff: RideHeightDiffCell,
    };
    const Cell = cellMapping[tableDisplay];
    return (
      <div className="App">
        <div>
          Эталон
          <select value={referenceWidth} name="referenceWidth" onChange={this.handleReferenceChange}>
            {WIDTH_OPTIONS.map(width =>
              <option key={width} value={width}>{width}</option>
            )}
          </select> /
          <select value={referenceHeight} name="referenceHeight" onChange={this.handleReferenceChange}>
            {HEIGHT_OPTIONS.map(height =>
              <option key={height} value={height}>{height}</option>
            )}
          </select> /
          R<select value={referenceDiameter} name="referenceDiameter" onChange={this.handleDiameterChange}>
            {DIAMETER_OPTIONS.map(diameter =>
              <option key={diameter} value={diameter}>{diameter}</option>
            )}
          </select>
        </div>
        <div>
          <select value={tableDisplay} name="tableDisplay" onChange={this.handleChange}>
            {TABLE_DISPLAY_OPTIONS.map(([option, label]) =>
              <option key={option} value={option}>{label}</option>
            )}
          </select>
        </div>
        {Object.keys(table).length && <><table>
          <thead>
            <tr>
              <th>
                R<select value={newDiameter} name="newDiameter" onChange={this.handleChange}>
                {this.getGoodDiameters().map(diameter =>
                  <option key={diameter} value={diameter}>{diameter}</option>
                )}
              </select>
              </th>
              {HEIGHT_OPTIONS.map(height => <th key={`col-header-${height}`}>{height}</th>)}
            </tr>
          </thead>
          <tbody>
            {WIDTH_OPTIONS.map(width => <tr key={`row-header-${width}`}>
              <td>{width}</td>
              {
                HEIGHT_OPTIONS.map(
                  height => <Cell
                    key={`${width}/${height}/R${newDiameter}`}
                    data={table[`${width}/${height}/R${newDiameter}`]}
                  />
                )
              }
            </tr>)}
          </tbody>
        </table>
        { Object.entries(this.getList()).sort(([k]) => k).map(([diffScore, tires]) => <ul key={diffScore}>
          {tires.map(({ key, diffScore }) => <TireItemStyled key={key} diffScore={diffScore}>{key}</TireItemStyled>)}
        </ul>) }

        </>}


      </div>
    );
  }
}

const CellStyled = styled.td`
  background-color: ${p => ({
  [true]: 'none',
  [p.diffScore <= 3]: COLORS.meh,
  [p.diffScore <= 2]: COLORS.good,
  [p.diffScore <= 1]: COLORS.best,
}.true)};
`;

const TireItemStyled = styled.li`
  background-color: ${p => ({
  [true]: 'none',
  [p.diffScore <= 3]: COLORS.meh,
  [p.diffScore <= 2]: COLORS.good,
  [p.diffScore <= 1]: COLORS.best,
}.true)};
`
export default App;

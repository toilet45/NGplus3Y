import { MasteryStudyConnectionSetup } from "./MasteryStudyConnection";
import { MasteryStudySetup } from "./MasteryStudyButton";

class MasteryStudyRow {
  constructor(layout, items, isWide) {
    this.layout = layout;
    this.items = items;
    this.isWide = isWide;
  }

  get width() {
    const itemCount = this.items.length;
    const layout = this.layout;
    return itemCount * layout.itemWidth + (itemCount - 1) * layout.spacing;
  }

  itemPosition(column, treeLayout) {
    const layout = this.layout;
    const treeWidth = treeLayout.width;
    const rowLeft = (treeWidth - this.width) / 2;
    return rowLeft + column * layout.itemWidth + column * layout.spacing;
  }
}

class MasteryStudyRowLayout {
  constructor(props) {
    this.itemWidth = props.itemWidth;
    this.itemHeight = props.itemHeight;
    this.spacing = props.spacing;
  }
}

export class MasteryStudyTreeLayout {
  constructor(type, scaling = 1) {
    this.spacing = 4 * scaling;

    const normalRowLayout = new MasteryStudyRowLayout({
      itemWidth: 18 * scaling,
      itemHeight: 10 * scaling,
      spacing: 3 * scaling
    });

    const wideRowLayout = new MasteryStudyRowLayout({
      itemWidth: 12 * scaling,
      itemHeight: 10 * scaling,
      spacing: 0.6 * scaling
    });
    const normalRow = (...items) => new MasteryStudyRow(normalRowLayout, items);
    const wideRow = (...items) => new MasteryStudyRow(wideRowLayout, items, true);

    const MS = id => (MasteryStudy(id).isUnlocked ? MasteryStudy(id) : null);
    const EC = id => MasteryStudy.eternityChallenge(id);

    /**
     * @type {MasteryStudyRow[]}
     */
    /* eslint-disable no-multi-spaces, space-in-parens, func-call-spacing */
    this.rows = [
      normalRow(                       null,   MS(11),   null                         ),
      wideRow(MS(21),MS(22),MS(23),MS(24),MS(25),MS(26))
          ];
    /* eslint-enable no-multi-spaces, space-in-parens, func-call-spacing */

    /**
     * @type {MasteryStudySetup[]}
     */
    this.studies = [];
    for (let rowIndex = 0; rowIndex < this.rows.length; rowIndex++) {
      const row = this.rows[rowIndex];
      for (let columnIndex = 0; columnIndex < row.items.length; columnIndex++) {
        const study = row.items[columnIndex];
        if (study === null) continue;
        const setup = new MasteryStudySetup({
          study,
          row: rowIndex,
          column: columnIndex
        });
        if (row.isWide) {
          setup.isSmall = true;
        }
        this.studies.push(setup);
      }
    }

    /**
     * @type {MasteryStudyConnectionSetup[]}
     */
    this.connections = MasteryStudy.allConnections
      .map(c => new MasteryStudyConnectionSetup(c));

    this.width = this.rows.map(row => row.width).max();
    const heightNoSpacing = this.rows.map(r => r.layout.itemHeight).sum();
    this.height = heightNoSpacing + (this.rows.length - 1) * this.spacing;

    for (const study of this.studies) {
      study.setPosition(this);
    }

    for (const connection of this.connections) {
      connection.setPosition(this.studies, this.width, this.height);
    }
  }

  itemPosition(row) {
    const rows = this.rows.slice(0, row);
    const heightNoSpacing = rows.map(r => r.layout.itemHeight).sum();
    return heightNoSpacing + rows.length * this.spacing;
  }

  static create(type, scaling = 1) {
    if (this._instances === undefined) {
      this._instances = [];
    }
    const layout = new MasteryStudyTreeLayout(type, scaling);
    this._instances[`${type}__${scaling}`] = layout;
    return layout;
  }
}

export const MASTERY_STUDY_TREE_LAYOUT_TYPE = {
  NORMAL: 0,
  POST_QUANTUM: 1,
  POST_ELECTRONS: 2,
  POST_QC: 3,
  POST_PC: 4,
  POST_EMP: 5,
  POST_EDIM: 6,
  POST_TOD: 7,

  get current() {
    return this.NORMAL;
  }
};

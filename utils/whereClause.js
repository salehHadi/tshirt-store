// I have Filter bug Ero msg: TypeError: Converting circular structure to JSON
class WhereClause {
  constructor(base, bigQ) {
    (this.base = base), (this.bigQ = bigQ);
  }

  search() {
    const searchword = this.bigQ.search
      ? {
          name: {
            $regex: this.bigQ.search,
            $options: "i",
          },
        }
      : {};

    this.base = this.base.find({ ...searchword });

    return this;
  }

  filter() {
    const copyQ = { ...this.base };

    delete copyQ["search"];
    delete copyQ["limit"];
    delete copyQ["page"];

    // convert copeQ into a string copeQ

    let stringOfCopeQ = JSON.stringify(copyQ);

    stringOfCopeQ = stringOfCopeQ.replace(
      /\b(gte|lte|gt|lt)\b/g,
      (m) => `$${m}`
    );

    const jsonOfCopeQ = JSON.parse(stringOfCopeQ);

    this.base = this.base.find(jsonOfCopeQ);

    return this;
  }

  pager() {
    let currentPage = 1;

    if (this.bigQ.page) {
      currentPage = this.bigQ.page;
    }
    const skipVal = this.bigQ.page * (currentPage - 1);
    this.base = this.base.limit(this.bigQ.page).skip(skipVal);
    return this;
  }
}

module.exports = WhereClause;

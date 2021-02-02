_ = require 'lodash'
assert = require('chai').assert
fixtures = require '../fixtures'
LabeledExprGenerator = require '../../src/datagrids/LabeledExprGenerator'
canonical = require 'canonical-json'

compare = (actual, expected) ->
  assert.equal canonical(actual), canonical(expected), "\n" + canonical(actual) + "\n" + canonical(expected) + "\n"

describe "LabeledExprGenerator", ->
  before ->
    @schema = fixtures.simpleSchema()
    @labeledExprGenerator = new LabeledExprGenerator(@schema)

  it "creates basic list", ->
    les = @labeledExprGenerator.generate("t1", {})

    # Make equivalent list
    expectedLes = []
    for column in @schema.getColumns("t1")
      if column.type != "join"
        expectedLes.push({ expr: { type: "field", table: "t1", column: column.id }, label: column.name.en, joins: [] })

    compare les, expectedLes

  it "includes cascading ref columns", ->
    schema = fixtures.cascadingRefSchema()
    labeledExprGenerator = new LabeledExprGenerator(schema)

    les = labeledExprGenerator.generate("t2", { multipleJoinCondition: (-> true) })
    console.log(les)

  it "includes n-1 joins", ->
    les = @labeledExprGenerator.generate("t1", { multipleJoinCondition: (-> true) })

    # Make equivalent list
    expectedLes = []
    for column in @schema.getColumns("t1")
      if column.type != "join"
        expectedLes.push({ expr: { type: "field", table: "t1", column: column.id }, label: column.name.en, joins: [] })

    # Add t2
    for column in @schema.getColumns("t2")
      if column.type != "join"
        expectedLes.push({ expr: { type: "field", table: "t2", column: column.id }, label: column.name.en, joins: ["1-2"] })

    compare les, expectedLes

  it "numbers duplicate named columns", ->
    # Create t1 with duplicate named column
    t1 = @schema.getTable("t1")
    t1 = _.cloneDeep(t1)
    t1.contents.push({ id: "text2", name: { en: "Text" }, type: "text" })
    schema = @schema.addTable(t1)

    les = new LabeledExprGenerator(schema).generate("t1", { numberDuplicatesLabels: true })

    # Make equivalent list
    expectedLes = []
    for column in schema.getColumns("t1")
      if column.type != "join"
        expectedLes.push({ expr: { type: "field", table: "t1", column: column.id }, label: column.name.en, joins: [] })

    expectedLes[0].label = "Text (1)"
    _.last(expectedLes).label = "Text (2)"

    compare les, expectedLes


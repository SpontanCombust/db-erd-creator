enum DbTableRelationKind {
    OneToOne = "11",
    OneToMany = "1N",
    ManyToMany = "NN",
    InheritsFrom = "EXT"
}

export default DbTableRelationKind;
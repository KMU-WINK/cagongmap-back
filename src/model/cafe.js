import {
    Schema,
    model,
} from "mongoose";

export const TypeOfTables = ['single', 'double', 'bar'];

const Point = new Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number],
        required: true
    }
});

const Table = new Schema(
    {
        typeOfTable: {
            type: String,
            enum: TypeOfTables,
            required: true
        },
        countOfPlugs: {
            type: Number,
            required: true
        },
        countOfTables: {
            type: Number,
            default: 0,
        }
    },
    {
        versionKey: false,
    }
)

const schema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        totalOfTables: {
            type: Number,
            default: 0
        },
        totalOfPlugs: {
            type: Number,
            default: 0
        },
        openTime: {
            type: String,
            default: ""
        },
        closeTime: {
            type: String,
            default: ""
        },
        tables: {
            type: [Table],
            default: [],
        },
        location: {
            type: Point,
            required: true,
            index: '2dsphere'
        },
        images: {
            type: [String],
            default: []
        }
    },
    {
        versionKey: false,
    }
);

export const Cafe = model("cafe", schema);

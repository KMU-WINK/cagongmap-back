import {
    Cafe
} from "src/model/cafe";

export const getById = async (id) => {
    return await Cafe.findById(id).exec();
};

export const getByLocation = async (lng, lat, range, page, perPage) => {
    const documents = await Cafe.find({
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [lng, lat]
                },
                $maxDistance: range
            }
        }
    }).skip(page * perPage).limit(perPage).exec();
    return documents;
};
/*const doesCafeExist = await Cafe.exists({ name: body.name });
    if (doesCafeExist) {
        return {};
    }*/
export const addNew = async (body) => {
    body.location = { type: 'Point', coordinates: body.location.coordinates };
    const cafe = await Cafe.create(body).save();
    return cafe;
}

export const updateData = async (id, body) => {
    const doesCafeExist = await Cafe.exists({ name: body.name });
    if (!doesCafeExist) {
        return 1;
    }
    await Cafe.updateOne({ id: id })
    return 0;
}
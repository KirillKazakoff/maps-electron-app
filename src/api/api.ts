import { Coordinates, Vessel } from './models';
import axios from 'axios';
import { SSDT } from '../utils/types/f16';

const baseUrl = 'http://127.0.0.1:9092';

const updateZones = async (data: unknown) => {
    await axios.post(`${baseUrl}/zones`, data);
};
const ping = async () => {
    const res = await axios.get(`${baseUrl}/ping`);
    return res;
};
const sendSSDInfo = async (data: SSDT[][]) => {
    try {
        await axios.post(`${baseUrl}/ssd`, data);
    } catch (e) {
        console.log(e.message);
    }
};
const sendCoordinates = async (data: Coordinates[]) => {
    await axios.post(`${baseUrl}/coordinates`, data);
};
const getVesselById = async (id: string) => {
    const res = await axios.get<Vessel>(`${baseUrl}/vesselsById/${id}`);
    return res.data;
};
const getVesselsByCompanyId = async (companyId: string) => {
    const res = await axios.get<Vessel[]>(`${baseUrl}/vessels/${companyId}`);
    return res.data.map((vessel) => vessel.id);
};

const sendDebugBackedn = (param: string) => {
    axios.post(`${baseUrl}/debug`, param);
};

export const api = {
    update: {
        zones: updateZones,
    },
    send: {
        ssdInfo: sendSSDInfo,
        coordinates: sendCoordinates,
        debugBackedn: sendDebugBackedn,
    },
    get: {
        vesselsByCompany: getVesselsByCompanyId,
        vessel: getVesselById,
        ping,
    },
};

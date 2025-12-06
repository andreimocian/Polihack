import axios from "axios";

export const postVolunteerShelter = (payload: {
  capacity: number;
  lat: number;
  lng: number;
}) => {
  return axios.post("/volunteer/shelter", payload);
};

// Importing axios
import axios from 'axios';

// Importing Interface
import { IAxiosRequest } from '../interfaces/axios.interface';

const axiosInstance = axios.create({
  withCredentials: true
});

const getRequest = (data: IAxiosRequest) => {
  const { path, config, success, error, final } = data;
  axiosInstance.get(path, config).then(success).catch(error).finally(final);
};

const postRequest = (data: IAxiosRequest) => {
  const { path, payload, config, success, error, final } = data;
  axiosInstance.post(path, payload, config).then(success).catch(error).finally(final);
};

const putRequest = (data: IAxiosRequest) => {
  const { path, payload, success, error, config, final } = data;
  axiosInstance.put(path, payload, config).then(success).catch(error).finally(final);
};

const deleteRequest = (data: IAxiosRequest) => {
  const { path, success, error, final } = data;
  axiosInstance.delete(path).then(success).catch(error).finally(final);
};

export default {
  getRequest,
  postRequest,
  putRequest,
  deleteRequest
};

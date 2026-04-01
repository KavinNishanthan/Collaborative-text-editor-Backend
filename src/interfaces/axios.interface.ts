export interface IAxiosRequest{
    path: string;
    payload?: object;
    config?: object;
    success?: (data: any) => any;
    error?: (data: any) => any;
    final?: () => any;
}
declare module "multer" {
    import type { Request, RequestHandler } from "express";

    type UploadedFile = {
        originalname: string;
    };

    type DestinationCallback = (error: Error | null, destination: string) => void;
    type FilenameCallback = (error: Error | null, filename: string) => void;

    type DiskStorageOptions = {
        destination?: (req: Request, file: UploadedFile, cb: DestinationCallback) => void;
        filename?: (req: Request, file: UploadedFile, cb: FilenameCallback) => void;
    };

    type StorageEngine = Record<string, unknown>;

    type MulterOptions = {
        storage?: StorageEngine;
        limits?: {
            fileSize?: number;
        };
    };

    function multer(options?: MulterOptions): RequestHandler;

    namespace multer {
        function diskStorage(options: DiskStorageOptions): StorageEngine;
    }

    export default multer;
}

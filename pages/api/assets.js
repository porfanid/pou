import * as admin from "../../firebase/adminConfig";
import { spawn } from 'child_process';
import stream from 'stream';

const bucket = await admin.storage();

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { fullScale, path } = req.query;
    const imagePath = path;

    console.log("The image path is: ", imagePath);

    if (!imagePath) {
        return res.status(400).json({ error: "Image path is required" });
    }

    let filePath = `images/${imagePath}`;
    const file = bucket.file(filePath);

    try {
        // Get file metadata
        const [metadata] = await file.getMetadata();

        if (!metadata.metadata?.width) {
            // Download file buffer and calculate dimensions
            const [fileBuffer] = await file.download();
            const dimensions = await getImageDimensionsBuffer(fileBuffer);

            // Update metadata with width & height
            const newMetadata = {
                metadata: {
                    width: dimensions.width.toString(),
                    height: dimensions.height.toString(),
                },
            };
            await file.setMetadata(newMetadata);
            metadata.metadata = newMetadata.metadata;
        }

        const { width, height } = metadata.metadata;
        const aspectRatio = width / height;
        const tolerance = 0.5;

        if (fullScale !== "true") {
            filePath = changeAnalysis(
                filePath,
                "800x800",
                "800x600",
                Math.abs(aspectRatio - 1) <= tolerance
            );
        }

        // Get updated file reference
        const updatedFile = bucket.file(filePath);

        const oneDayLater = new Date();
        oneDayLater.setDate(oneDayLater.getDate() + 1);

        // Generate a signed URL
        const [url] = await updatedFile.getSignedUrl({
            action: "read",
            expires: oneDayLater.toISOString(),
        });

        // Redirect user to signed URL
        res.redirect(url);
    } catch (error) {
        console.error("Error fetching file:", error);
        res.status(404).json({ error: "File not found" });
    }
}


function getImageDimensionsBuffer(buffer) {
    return new Promise((resolve, reject) => {
        const identifyProcess = spawn('identify', ['-format', '%wx%h', '-']);

        // Write buffer to the stdin of the identify process
        const bufferStream = new stream.PassThrough();
        bufferStream.end(buffer);
        bufferStream.pipe(identifyProcess.stdin);

        let decodedStdout = '';

        identifyProcess.stdout.on('data', (chunk) => {
            decodedStdout += chunk.toString();
        });

        identifyProcess.stderr.on('data', (error) => {
            console.error('Error:', error.toString());
            reject(new Error('Failed to identify image dimensions'));
        });

        identifyProcess.on('close', (code) => {
            if (code === 0) {
                const [width, height] = decodedStdout.trim().split('x');
                resolve({width: parseInt(width, 10), height: parseInt(height, 10)});
            } else {
                reject(new Error('identify command failed'));
            }
        });
    });
}


function changeAnalysis(
    fileName,
    analysis_true,
    analysis_false,
    change_analysis
) {
    // Find the position of the last dot, which indicates the start of the extension
    const dotIndex = fileName.lastIndexOf(".");

    // If there's no dot, return the filename with the suffix appended
    if (dotIndex === -1) {
        return `${fileName}_${
            change_analysis ? analysis_true : analysis_false
        }`;
    }

    // Extract the name and extension parts
    const name = fileName.substring(0, dotIndex);
    const extension = fileName.substring(dotIndex);

    console.log(
        `${name}_${change_analysis ? analysis_true : analysis_false}${extension}`
    );

    // Construct the new filename
    return `${name}_${
        change_analysis ? analysis_true : analysis_false
    }${extension}`;
}

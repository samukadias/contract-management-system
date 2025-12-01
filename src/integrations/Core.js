export const UploadFile = async ({ file }) => {
    // Mock upload
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ file_url: URL.createObjectURL(file) });
        }, 1000);
    });
};

export const ExtractDataFromUploadedFile = async ({ file_url, json_schema }) => {
    // Mock extraction - in a real app this would call an AI service
    // For now, we'll try to parse CSV if possible or return mock data
    return new Promise((resolve) => {
        setTimeout(() => {
            // Fetch the blob content
            fetch(file_url)
                .then(res => res.text())
                .then(text => {
                    // Very basic CSV parsing
                    const lines = text.split('\n');
                    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

                    const contracts = lines.slice(1).filter(l => l.trim()).map(line => {
                        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
                        const contract = {};
                        headers.forEach((header, index) => {
                            contract[header] = values[index];
                        });
                        return contract;
                    });

                    resolve({
                        status: "success",
                        output: { contracts }
                    });
                })
                .catch(err => {
                    resolve({
                        status: "error",
                        details: "Failed to parse file"
                    });
                });
        }, 2000);
    });
};

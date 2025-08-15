
const logs = [];
const MAX_LOGS = 100;

const addLog = (log) => {
    const timestamp = new Date().toISOString();
    const logEntry = { ...log, timestamp };
    logs.unshift(logEntry);
    if (logs.length > MAX_LOGS) {
        logs.pop();
    }
};

const getLogs = () => {
    return logs;
};

const clearLogs = () => {
    logs.length = 0;
};

module.exports = {
    addLog,
    getLogs,
    clearLogs,
};

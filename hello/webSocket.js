           function runAsCliServer() {
                const API_REQUEST_TYPE = 'ADMIN_API';
                const FILE_REQUEST_TYPE = 'FILE_TRANSFER';
                const cliHost = argv.cliHost;
                const cliPort = argv.cliPort;
                const eventEmitter = new events.EventEmitter();
                const wss = new ws.Server({host: cliHost, port: cliPort});
                const apiSocket = createSocket(broadcast.bind(null, API_REQUEST_TYPE));
                const fileSocket = createSocket(broadcast.bind(null, FILE_REQUEST_TYPE));
                const fileWriterFactory = remoteFileWriterFactory({socket: fileSocket});
                const fileReaderFactory = remoteFileReaderFactory({
                    eventEmitter,
                    socket: fileSocket,
                    EVENT_TYPE: FILE_REQUEST_TYPE
                });

				console.log("emitter on %s",API_REQUEST_TYPE);
                eventEmitter.on(API_REQUEST_TYPE, handleRemoteApiRequest);

                wss.on('connection', (wsc) => {
                    wsc.on('message', handleWebSocketClientMsg);
                });

                wss.on('listening', () => {
                    logger.log(`CLI server is listening on ${cliHost}:${cliPort}`);
                });

                function handleWebSocketClientMsg(data) {
                    const internalRequest = validateJson(data);

                    if (!internalRequest.isValid) {
                        sendFailRespose(apiSocket, INVALID_JSON_MSG);
                        return;
                    }

                    const requestObject = internalRequest.dataParsed;
                    if (requestObject.type === API_REQUEST_TYPE || requestObject.type === FILE_REQUEST_TYPE)
                        eventEmitter.emit(requestObject.type, requestObject.payload);
                }

                function handleRemoteApiRequest(request) {
					console.log("#### have request");
                    if (normalizeRequest(request)) {
						console.log("request %j",request);
                        const parameters = request.parameters.parameters;

                        if (parameters.inputFileContent === '')
                            parameters.inputFileContent = fileReaderFactory.create(request.requestId);
                        else if (_.isString(parameters.inputFileContent))
                            parameters.inputFileContent = bufferReaderFactory.create(Buffer.from(parameters.inputFileContent, 'base64'));

                        if (parameters.outputFileContent === ''){
							console.log("create file factory");
                            parameters.outputFileContent = fileWriterFactory.create(request.requestId);
                        }else
                            parameters.outputFileContent = bufferWriterFactory.create();
                    }

                    adminApi.handle(request, apiSocket);
                }

                function broadcast(type, payload) {
                    wss.clients.forEach((client) => {
						console.log("### server broadcast type=%s, payload=%j",type,payload);
                        client.send(JSON.stringify({
                            type,
                            payload
                        }));
                    });
                }
            }

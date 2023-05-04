const crc = require('crc');

// JSON Body 구성
const jsonBody = {"dataType":"COMMAND","param":{"commandType":"MOVE_FORWARD","distance":10}};

// 패킷 데이터 생성
const startCode = new Uint8Array([0x0A, 0x55]); // 2바이트 시작 코드
const packetLen = 2 + 4 + JSON.stringify(jsonBody).length + 2; // 2바이트 시작 코드, 4바이트 패킷 길이, JSON Body, 2바이트 CRC16을 합한 값
const packetLenBytes = new Uint8Array(new Uint32Array([packetLen]).buffer); // 패킷 길이를 4바이트 빅엔디안으로 변환
const jsonBytes = new TextEncoder().encode(JSON.stringify(jsonBody)); // JSON을 바이트 형태로 변환
const crc16Bytes = new Uint8Array(new Uint16Array([0]).buffer); // CRC16 초기값 (0)을 2바이트 빅엔디안으로 변환

// 패킷 생성
const packet = new Uint8Array(startCode.length + packetLenBytes.length + jsonBytes.length + crc16Bytes.length);
packet.set(startCode, 0);
packet.set(packetLenBytes, startCode.length);
packet.set(jsonBytes, startCode.length + packetLenBytes.length);
packet.set(crc16Bytes, startCode.length + packetLenBytes.length + jsonBytes.length); // 불필요??

// CRC16 계산
const crc16 = crc.crc16ccitt(Buffer.concat([startCode, packetLenBytes, jsonBytes]));
packet.set(new Uint8Array(new Uint16Array([crc16]).buffer), startCode.length + packetLenBytes.length + jsonBytes.length);

// 결과 출력
console.log(packet);







// 패킷 데이터 수신
const receivedPacket = Buffer.from(packet);

// start code 파싱
const startCodeR = receivedPacket.slice(0, 2);

// packet length 파싱
const packetLengthR = receivedPacket.slice(2, 6);

// body 파싱
const bodyR = receivedPacket.slice(6, receivedPacket.length - 2).toString();

// CRC 계산
const crcValue = crc.crc16ccitt(Buffer.concat([startCodeR, packetLengthR, Buffer.from(bodyR)]));

// 수신된 CRC 값 파싱
const receivedCrcValue = receivedPacket.readUInt16LE(receivedPacket.length - 2);

// CRC 체크
if (crc16 !== receivedCrcValue) {
  console.log('Invalid CRC');
  return;
}

// body JSON 파싱
const bodyObject = JSON.parse(bodyR);
console.log(bodyObject); 



import nacl from 'tweetnacl';
import util from 'tweetnacl-util';
import AesGCM from './aes-gcm';

/**
 * Return new base64, NaCl, public-private key pair.
 * @returns {Object} obj
 * @returns {String} obj.publicKey - base64, NaCl, public key
 * @returns {String} obj.privateKey - base64, NaCl, private key
 */
const generateKeyPair = () => {
	const pair = nacl.box.keyPair();
	
	return ({
		publicKey: util.encodeBase64(pair.publicKey),
		privateKey: util.encodeBase64(pair.secretKey)
	});
}

/**
 * Return assymmetrically encrypted [plaintext] using [publicKey] where
 * [publicKey] likely belongs to the recipient.
 * @param {Object} obj
 * @param {String} obj.plaintext - plaintext to encrypt
 * @param {String} obj.publicKey - public key of the recipient
 * @param {String} obj.privateKey - private key of the sender (current user)
 * @returns {Object} obj
 * @returns {String} ciphertext - base64-encoded ciphertext
 * @returns {String} nonce - base64-encoded nonce
 */
const encryptAsymmetric = ({
	plaintext,
	publicKey,
	privateKey
}: {
	plaintext: string;
	publicKey: string;
	privateKey: string;
}) => {
  const nonce = nacl.randomBytes(24);
  const ciphertext = nacl.box(
    util.decodeUTF8(plaintext),
    nonce,
    util.decodeBase64(publicKey),
    util.decodeBase64(privateKey)
  );

	return {
		ciphertext: util.encodeBase64(ciphertext),
		nonce: util.encodeBase64(nonce)
	};
};

/**
 * Return assymmetrically decrypted [ciphertext] using [privateKey] where
 * [privateKey] likely belongs to the recipient.
 * @param {Object} obj
 * @param {String} obj.ciphertext - ciphertext to decrypt
 * @param {String} obj.nonce - nonce
 * @param {String} obj.publicKey - public key of the sender
 * @param {String} obj.privateKey - private key of the receiver (current user)
 * @param {String} plaintext - UTF8 plaintext
 */
const decryptAsymmetric = ({
	ciphertext,
	nonce,
	publicKey,
	privateKey
}: {
	ciphertext: string;
	nonce: string;
	publicKey: string;
	privateKey: string;
}): string => {
  const plaintext: any = nacl.box.open(
    util.decodeBase64(ciphertext),
    util.decodeBase64(nonce),
    util.decodeBase64(publicKey),
    util.decodeBase64(privateKey)
  );

	return util.encodeUTF8(plaintext);
};

/**
 * Return symmetrically encrypted [plaintext] using [key].
 * @param {Object} obj
 * @param {String} obj.plaintext - plaintext to encrypt
 * @param {String} obj.key - hex key
 */
const encryptSymmetric = ({
	plaintext,
	key
}: {
	plaintext: string;
	key: string;
}) => {
  const obj = AesGCM.encrypt(plaintext, key);
  const { ciphertext, iv, tag } = obj;

	return {
		ciphertext,
		iv,
		tag
	};
};

/**
 * Return symmetrically decypted [ciphertext] using [iv], [tag],
 * and [key].
 * @param {Object} obj
 * @param {String} obj.ciphertext - ciphertext to decrypt
 * @param {String} obj.iv - iv
 * @param {String} obj.tag - tag
 * @param {String} obj.key - hex key
 *
 */
const decryptSymmetric = ({
	ciphertext,
	iv,
	tag,
	key
}: {
	ciphertext: string;
	iv: string;
	tag: string;
	key: string;
}): string => {
  const plaintext = AesGCM.decrypt(ciphertext, iv, tag, key);
	return plaintext;
};

export {
	generateKeyPair,
	encryptAsymmetric,
	decryptAsymmetric,
	encryptSymmetric,
	decryptSymmetric
};

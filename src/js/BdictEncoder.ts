import buffer from "buffer";

/**
 * Decode bdict to an object. The specifications for bdict is written in the python side.
 *
 * @param bdict Bdict data
 */
export async function bdictDecode(bdict: ArrayBuffer): Promise<any>
{
  const buf = buffer.Buffer.from(bdict)

  let i = 0
  const dic = {}

  while (i < buf.byteLength)
  {
    const lk = buf.readUInt32BE(i)
    i += 4
    const lv = buf.readUInt32BE(i)
    i += 4
    const k = buf.subarray(i, i + lk).toString('utf-8')
    i += lk
    const v = buf.subarray(i, i + lv)
    i += lv

    dic[k] = v
  }

  return dic
}

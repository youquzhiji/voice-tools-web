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
  const enc = new TextDecoder()

  while (i < buf.byteLength)
  {
    const lk = buf.readUInt32BE(i)
    i += 4
    const lv = buf.readUInt32BE(i)
    i += 4
    const k = enc.decode(bdict.slice(i, i + lk))
    i += lk
    const v = bdict.slice(i, i + lv)
    i += lv

    dic[k] = v
  }

  return dic
}

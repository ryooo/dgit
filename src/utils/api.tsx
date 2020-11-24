import useSWR from 'swr';
import axios from 'axios';
import path from 'path';

const jsonFetcher = (url: string) => axios.get(url).then(res => res.data)

export const useMarkdownApi = (filePath: string) => {
  return {
    data: {markdown: "# test\n\n## sample\n\n![asdf](https://image.flaticon.com/icons/png/512/37/37318.png)\n\n- aaa\n- bbb\n  - ddd\n  - eee\n- ccc\n\n> asdfa\n\naa\n"},
    error: null,
  }
}

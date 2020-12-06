import useSWR from 'swr';
import axios from 'axios';
import path from 'path';

const jsonFetcher = (url: string) => axios.get(url).then(res => res.data)

export const useMarkdownApi = (filePath: string) => {
  return {
    data: {markdown: "# test\n\n## sample\n:+1::+1::+1::+1::+1::+1:\n\nあああ <div>asdf</div>っっｂ\n\n[aaa](https://codemirror.net/doc/manual.html) ~~aaa~~ bbb\n[dau]\n\n$f(x) = sum_{i=0}^n x_i$ \ntoto\n<img class='hmd-image' alt='asdf' src='https://octodex.github.com/images/daftpunktocat-thomas.gif' width=100>\n\n[dau]を伸ばすには...\n\n- [x] aaa\n\n![asdf](https://image.flaticon.com/icons/png/128/23/23807.png 30x)\n\n- aaa\n- bbb\n  - ddd\n  - eee\n- ccc\n\n> asdfa\n\naa\n[dau]: 日次ユーザー数 - Daily Active Users"},
    error: null,
  }
}

import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from '@styles/components/PrevNextNav.module.scss'
import classNames from 'classnames'

type Props = {
  theme?: string;
}

const PrevNextNav: React.FC<Props> = (props) => {
  const cls = classNames(styles["prev-next-link"], styles[props.theme])
  return (
    <div className={cls}>
      <a className={styles["prev-link"]} href="#">
        <div>
          <p className={styles["prev-label"]}>前の記事</p>
          <p>
            コピペでできる！CSS3の素敵効果でテキストリンクを装飾する小技あれこれ
          </p>
        </div>
      </a>
      <a className={styles["next-link"]} href="#">
        <div>
          <p className={styles["prev-label"]}>次の記事</p>
          <p>
            ユーザビリティテストの被験者をしてみて感じた、テストの流れや重要ポイント
          </p>
        </div>
      </a>
    </div>
  );
}
export default PrevNextNav;
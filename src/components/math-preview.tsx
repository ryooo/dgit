import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'

type Props = {
}

const MathPreview: React.FC<Props> = (props) => {
  return (
    <div id="math-preview-template" className="math-preview-base hidden">
      <div className="math-preview-content">
        <span className="math-preview-icon"><FontAwesomeIcon icon="pencil-alt" /></span>
      </div>
    </div>
  );
}

export default MathPreview;

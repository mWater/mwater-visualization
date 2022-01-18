import React from "react"
import dompurify from "dompurify"

export interface HtmlUrlLegendProps {
  url: string
}

interface HtmlUrlLegendState {
  html: string
}

/** Loads a html legend and sanitizes it from a url */
export class HtmlUrlLegend extends React.Component<HtmlUrlLegendProps, HtmlUrlLegendState> {
  constructor(props: HtmlUrlLegendProps) {
    super(props)
    this.state = {
      html: ""
    }
  }

  componentDidMount() {
    this.loadLegend()
  }

  componentDidUpdate(prevProps: HtmlUrlLegendProps) {
    if (prevProps.url !== this.props.url) {
      this.loadLegend()
    }
  }

  loadLegend() {
    window
      .fetch(this.props.url)
      .then((response) => response.text())
      .then((html) => {
        const safeHtml = dompurify.sanitize(html)
        this.setState({ html: safeHtml })
      })
  }

  render() {
    return <div dangerouslySetInnerHTML={{ __html: this.state.html }} />
  }
}

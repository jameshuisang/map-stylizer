import React, { type DragEvent, type FormEvent } from "react";
import { MdFileUpload } from "react-icons/md";
import { MdAddCircleOutline } from "react-icons/md";
import { Trans, type WithTranslation, withTranslation } from "react-i18next";

import { ModalLoading } from "./ModalLoading";
import { Modal } from "./Modal";
import { InputButton } from "../InputButton";
import { InputUrl } from "../InputUrl";

import { ensureStyleValidity } from "../../libs/style";
import { isIndoorTheme, parseIndoorTheme, type IndoorTheme } from "../../libs/indoor-theme";
import publicStyles from "../../config/styles.json";

type PublicStyleProps = {
  url: string
  thumbnailUrl: string
  title: string
  onSelect(...args: unknown[]): unknown
};

class PublicStyle extends React.Component<PublicStyleProps> {
  render() {
    return <div className="maputnik-public-style">
      <InputButton
        className="maputnik-public-style-button"
        aria-label={this.props.title}
        onClick={() => this.props.onSelect(this.props.url)}
      >
        <div className="maputnik-public-style-header">
          <div>{this.props.title}</div>
          <span className="maputnik-space" />
          <MdAddCircleOutline />
        </div>
        <div
          className="maputnik-public-style-thumbnail"
          style={{
            backgroundImage: `url(${this.props.thumbnailUrl})`
          }}
        ></div>
      </InputButton>
    </div>;
  }
}

type ModalOpenInternalProps = {
  isOpen: boolean
  onOpenToggle(): void
  onStyleOpen(...args: unknown[]): unknown
  onIndoorOpen?(theme: IndoorTheme): void
  fileHandle: FileSystemFileHandle | null
} & WithTranslation;

type ModalOpenState = {
  styleUrl: string
  isDragOver: boolean
  error?: string | null
  activeRequest?: any
  activeRequestUrl?: string | null
};

class ModalOpenInternal extends React.Component<ModalOpenInternalProps, ModalOpenState> {
  private fileInputRef = React.createRef<HTMLInputElement>();

  constructor(props: ModalOpenInternalProps) {
    super(props);
    this.state = {
      styleUrl: "",
      isDragOver: false,
    };
  }

  acceptDocument = (body: unknown, fileHandle?: FileSystemFileHandle) => {
    if (isIndoorTheme(body) || (body && typeof body === "object" && "colors" in body)) {
      const theme = parseIndoorTheme(body);
      if (!this.props.onIndoorOpen) throw new Error("Indoor themes cannot be opened in this context.");
      this.props.onIndoorOpen(theme);
    } else {
      const value = body as { version?: number; layers?: unknown[]; sources?: object };
      if (!value || value.version !== 8 || !Array.isArray(value.layers) || !value.sources) {
        throw new Error("Choose a MapLibre v8 style or a Mappedin indoor theme JSON with colors.rooms and colors.map.");
      }
      this.props.onStyleOpen(ensureStyleValidity(body as Parameters<typeof ensureStyleValidity>[0]), fileHandle);
    }
    this.onOpenToggle();
  };

  clearError() {
    this.setState({
      error: null
    });
  }

  onCancelActiveRequest(e: Event) {
    // Else the click propagates to the underlying modal
    if (e) e.stopPropagation();

    if (this.state.activeRequest) {
      this.state.activeRequest.abort();
      this.setState({
        activeRequest: null,
        activeRequestUrl: null
      });
    }
  }

  onStyleSelect = (styleUrl: string) => {
    this.clearError();

    let canceled: boolean = false;

    fetch(styleUrl, {
      mode: "cors",
      credentials: "same-origin"
    })
      .then(function (response) {
        return response.json();
      })
      .then((body) => {
        if (canceled) {
          return;
        }

        this.setState({
          activeRequest: null,
          activeRequestUrl: null
        });

        this.acceptDocument(body);
      })
      .catch((err) => {
        this.setState({
          error: (err as Error).message || `Failed to load: '${styleUrl}'`,
          activeRequest: null,
          activeRequestUrl: null
        });
        console.error(err);
        console.warn("Could not open the style URL", styleUrl);
      });

    this.setState({
      activeRequest: {
        abort: function () {
          canceled = true;
        }
      },
      activeRequestUrl: styleUrl
    });
  };

  onSubmitUrl = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    this.onStyleSelect(this.state.styleUrl);
  };

  onOpenFile = async () => {
    this.clearError();

    const pickerOpts: OpenFilePickerOptions = {
      types: [
        {
          description: "json",
          accept: { "application/json": [".json"] },
        },
      ],
      multiple: false,
    };

    const [fileHandle] = await window.showOpenFilePicker(pickerOpts) as Array<FileSystemFileHandle>;
    const file = await fileHandle.getFile();
    const content = await file.text();

    let mapStyle;
    try {
      mapStyle = JSON.parse(content);
    } catch (err) {
      this.setState({
        error: (err as Error).toString()
      });
      return;
    }
    try { this.acceptDocument(mapStyle, fileHandle); }
    catch (err) { this.setState({ error: (err as Error).message }); }
    return file;
  };

  // it is not guaranteed that the File System Access API is available on all
  // browsers. If the function is not available, a fallback behavior is used.
  onFileChanged = (files: FileList | null) => {
    if (!files) return;
    if (files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    this.clearError();

    reader.readAsText(file, "UTF-8");
    reader.onload = e => {
      let mapStyle;
      try {
        mapStyle = JSON.parse(e.target?.result as string);
      }
      catch (err) {
        this.setState({
          error: (err as Error).toString()
        });
        return;
      }
      try { this.acceptDocument(mapStyle); }
      catch (err) { this.setState({ error: (err as Error).message }); }
    };
    reader.onerror = e => console.log(e.target);
  };

  onOpenToggle() {
    this.setState({
      styleUrl: "",
      isDragOver: false,
    });
    this.clearError();
    this.props.onOpenToggle();
  }

  onBrowseClick = async () => {
    if (typeof window.showOpenFilePicker === "function") {
      await this.onOpenFile();
      return;
    }

    this.fileInputRef.current?.click();
  };

  onFileDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!this.state.isDragOver) {
      this.setState({ isDragOver: true });
    }
  };

  onFileDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ isDragOver: false });
  };

  onFileDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    this.setState({ isDragOver: false });
    this.onFileChanged(e.dataTransfer.files);
  };

  onChangeUrl = (url: string) => {
    this.setState({
      styleUrl: url,
    });
  };

  render() {
    const t = this.props.t;
    const styleOptions = [{
      id: "minimal",
      title: "Minimal outdoor",
      url: new URL("../../templates/minimal/Minimal.outdoor.json", import.meta.url).href,
      thumbnail: new URL("../../templates/minimal/thumbnail.svg", import.meta.url).href
    }, ...publicStyles].map(style => {
      return <PublicStyle
        key={style.id}
        url={style.url}
        title={style.title}
        thumbnailUrl={style.thumbnail}
        onSelect={this.onStyleSelect}
      />;
    });

    let errorElement;
    if (this.state.error) {
      errorElement = (
        <div className="maputnik-modal-error">
          {this.state.error}
          <a href="#" onClick={() => this.clearError()} className="maputnik-modal-error-close">×</a>
        </div>
      );
    }

    return (
      <div>
        <Modal
          data-wd-key="modal:open"
          isOpen={this.props.isOpen}
          onOpenToggle={() => this.onOpenToggle()}
          title={t("Import style")}
        >
          {errorElement}
          <section className="maputnik-modal-section">
            <h1>{t("Import JSON")}</h1>
            <p>{t("Import a Mappedin indoor theme or MapLibre outdoor style.")}</p>
            <div
              data-wd-key="modal:open.dropzone"
              className={`maputnik-upload-dropzone${this.state.isDragOver ? " maputnik-upload-dropzone--active" : ""}`}
              role="button"
              tabIndex={0}
              onDragOver={this.onFileDragOver}
              onDragLeave={this.onFileDragLeave}
              onDrop={this.onFileDrop}
              onClick={() => void this.onBrowseClick().catch(error => { if (error.name !== "AbortError") this.setState({error:error.message}); })}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  void this.onBrowseClick().catch(error => { if (error.name !== "AbortError") this.setState({error:error.message}); });
                }
              }}
            >
              <div className="maputnik-upload-dropzone-content">
                <MdFileUpload className="maputnik-upload-dropzone-icon" aria-hidden="true" />
                <p className="maputnik-upload-dropzone-text">
                  {t("Drag and drop a style JSON file here or click to browse")}
                </p>
              </div>
              <input
                ref={this.fileInputRef}
                data-wd-key="modal:open.file.input"
                type="file"
                accept=".json,application/json"
                style={{ display: "none" }}
                onChange={(e) => this.onFileChanged(e.target.files)}
              />
            </div>
          </section>

          <details className="maputnik-modal-section">
            <summary>Import from a URL</summary>
            <form onSubmit={this.onSubmitUrl}>
              <h1>{t("Load from URL")}</h1>
              <p>
                <Trans t={t}>
                  Load from a URL. Note that the URL must have <a href="https://enable-cors.org" target="_blank" rel="noopener noreferrer">CORS enabled</a>.
                </Trans>
              </p>
              <InputUrl
                aria-label={t("Style URL")}
                data-wd-key="modal:open.url.input"
                type="text"
                className="maputnik-input"
                default={t("Enter URL...")}
                value={this.state.styleUrl}
                onInput={this.onChangeUrl}
                onChange={this.onChangeUrl}
              />
              <div>
                <InputButton
                  data-wd-key="modal:open.url.button"
                  type="submit"
                  className="maputnik-big-button"
                  disabled={this.state.styleUrl.length < 1}
                >Load from URL</InputButton>
              </div>
            </form>
          </details>

          <section className="maputnik-modal-section maputnik-modal-section--shrink">
            <h1>{t("Start from a template")}</h1>
            {this.props.onIndoorOpen && <InputButton data-wd-key="template:minimal" onClick={() => this.onStyleSelect(new URL("../../templates/minimal/Minimal.json", import.meta.url).href)}>Minimal indoor</InputButton>}
            <p>
              Choose the indoor theme or the matching outdoor map style.
            </p>
            <div className="maputnik-style-gallery-container">
              {styleOptions[0]}
            </div>
            <details className="maputnik-community-styles"><summary>More community styles</summary><div className="maputnik-style-gallery-container">{styleOptions.slice(1)}</div></details>
          </section>
        </Modal>

        <ModalLoading
          isOpen={!!this.state.activeRequest}
          title={t("Loading style")}
          onCancel={(e: Event) => this.onCancelActiveRequest(e)}
          message={t("Loading") + ": " + this.state.activeRequestUrl}
        />
      </div>
    );
  }
}

export const ModalOpen = withTranslation()(ModalOpenInternal);

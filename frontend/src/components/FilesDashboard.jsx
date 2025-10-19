import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useFilesStore } from "../store/filesStore";
import PageHeader from "./PageHeader";

const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${(props) => props.theme.colors.black};
`;

const UploadSection = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.sm};
  align-items: center;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    display: none;
  }
`;

const MobileUploadSection = styled.div`
  display: none;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    display: flex;
    gap: ${(props) => props.theme.spacing.sm};
    padding: ${(props) => props.theme.spacing.md};
    border-bottom: 2px solid ${(props) => props.theme.colors.white};
    flex-direction: column;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const Button = styled.button`
  padding: ${(props) => props.theme.spacing.md}
    ${(props) => props.theme.spacing.lg};
  background: ${(props) => props.theme.colors.white};
  color: ${(props) => props.theme.colors.black};
  border: 2px solid ${(props) => props.theme.colors.white};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: ${(props) => props.theme.colors.black};
    color: ${(props) => props.theme.colors.white};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    width: 100%;
    padding: ${(props) => props.theme.spacing.md};
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${(props) => props.theme.spacing.lg};

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    padding: ${(props) => props.theme.spacing.md};
  }
`;

const FileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${(props) => props.theme.spacing.lg};

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
    gap: ${(props) => props.theme.spacing.md};
  }
`;

const FileCard = styled.div`
  border: 2px solid ${(props) => props.theme.colors.white};
  padding: ${(props) => props.theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.md};
  transition: transform 0.2s;
  background: ${(props) => props.theme.colors.gray[900]};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 4px 4px 0 ${(props) => props.theme.colors.white};
  }
`;

const FileName = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  word-break: break-word;
  color: ${(props) => props.theme.colors.white};
`;

const FileInfo = styled.div`
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.gray[400]};
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`;

const FileActions = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.sm};
  margin-top: auto;
`;

const SmallButton = styled.button`
  flex: 1;
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.md};
  background: ${(props) =>
    props.variant === "danger"
      ? props.theme.colors.gray[800]
      : props.theme.colors.white};
  color: ${(props) =>
    props.variant === "danger"
      ? props.theme.colors.white
      : props.theme.colors.black};
  border: 2px solid ${(props) => props.theme.colors.white};
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${(props) =>
      props.variant === "danger"
        ? props.theme.colors.gray[700]
        : props.theme.colors.gray[800]};
    color: ${(props) => props.theme.colors.white};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${(props) => props.theme.spacing.xxl};
  border: 2px dashed ${(props) => props.theme.colors.gray[600]};

  h2 {
    font-size: 1.5rem;
    margin-bottom: ${(props) => props.theme.spacing.md};
    color: ${(props) => props.theme.colors.white};
  }

  p {
    color: ${(props) => props.theme.colors.gray[400]};
  }
`;

const StatusMessage = styled.div`
  padding: ${(props) => props.theme.spacing.md};
  border: 2px solid
    ${(props) =>
      props.isError ? props.theme.colors.gray[700] : props.theme.colors.white};
  background: ${(props) =>
    props.isError
      ? props.theme.colors.gray[800]
      : props.theme.colors.gray[900]};
  margin-bottom: ${(props) => props.theme.spacing.md};
  font-weight: 600;
  color: ${(props) => props.theme.colors.white};
`;

function FilesDashboard({ onMenuClick }) {
  const files = useFilesStore((state) => state.files);
  const isLoading = useFilesStore((state) => state.isLoading);
  const fetchFiles = useFilesStore((state) => state.fetchFiles);
  const uploadFileAction = useFilesStore((state) => state.uploadFile);
  const deleteFileAction = useFilesStore((state) => state.deleteFile);

  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchFiles(); // Will use cache if valid
  }, [fetchFiles]);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setStatusMessage(null);

    try {
      await uploadFileAction(file);
      setStatusMessage({
        text: `Successfully uploaded ${file.name}`,
        isError: false,
      });
    } catch (error) {
      setStatusMessage({
        text: `Error uploading file: ${
          error.response?.data?.detail || error.message
        }`,
        isError: true,
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (fileId, fileName) => {
    if (!confirm(`Delete "${fileName}"?`)) return;

    try {
      await deleteFileAction(fileId);
      setStatusMessage({ text: `Deleted ${fileName}`, isError: false });
    } catch (error) {
      setStatusMessage({
        text: `Error deleting file: ${
          error.response?.data?.detail || error.message
        }`,
        isError: true,
      });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Container>
      <FileInput
        ref={fileInputRef}
        type="file"
        id="file-upload"
        onChange={handleFileSelect}
        accept=".pdf,.docx,.doc,.txt,.csv,.xlsx,.xls"
      />

      <PageHeader title="Files Dashboard" onMenuClick={onMenuClick}>
        <UploadSection>
          <Button as="label" htmlFor="file-upload" disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload File"}
          </Button>
        </UploadSection>
      </PageHeader>

      <MobileUploadSection>
        <Button
          as="label"
          htmlFor="file-upload"
          disabled={isUploading}
          style={{ width: "100%" }}
        >
          {isUploading ? "Uploading..." : "Upload File"}
        </Button>
      </MobileUploadSection>

      <Content>
        {statusMessage && (
          <StatusMessage isError={statusMessage.isError}>
            {statusMessage.text}
          </StatusMessage>
        )}

        {isLoading ? (
          <EmptyState>
            <h2>Loading...</h2>
          </EmptyState>
        ) : files.length === 0 ? (
          <EmptyState>
            <h2>No Files Yet</h2>
            <p>Upload your first document to get started</p>
          </EmptyState>
        ) : (
          <FileGrid>
            {files.map((file) => (
              <FileCard key={file.id}>
                <FileName>{file.original_name}</FileName>
                <FileInfo>
                  <div>Type: {file.file_type.toUpperCase()}</div>
                  <div>Size: {formatFileSize(file.file_size)}</div>
                  <div>Uploaded: {formatDate(file.upload_date)}</div>
                  <div>
                    Status: {file.is_processed ? "✓ Processed" : "⋯ Processing"}
                  </div>
                </FileInfo>
                <FileActions>
                  <SmallButton
                    onClick={() => window.open(file.backblaze_url, "_blank")}
                  >
                    Download
                  </SmallButton>
                  <SmallButton
                    variant="danger"
                    onClick={() => handleDelete(file.id, file.original_name)}
                  >
                    Delete
                  </SmallButton>
                </FileActions>
              </FileCard>
            ))}
          </FileGrid>
        )}
      </Content>
    </Container>
  );
}

export default FilesDashboard;

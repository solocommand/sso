import { gql } from '@parameter1/graphql/tag';

export default gql`

extend type Query {
  "Returns a single workspace by full namespace."
  workspaceByNamespace(input: QueryWorkspaceByNamespaceInput!): Workspace
}

interface WorkspaceInterface {
  "The unique workspace identifier"
  _id: ObjectID! @project
  "The workspace key."
  key: String! @project
  "The workspace name."
  name: String! @project
  "The workspace namespaces."
  namespace: WorkspaceInterfaceNamespace! @project(deep: true) @object
  "The workspace path."
  path: String! @project
  "The workspace slug."
  slug: String! @project
}

type WorkspaceInterfaceNamespace {
  "The full, default and unique workspace namespace."
  default: String! @project
  "The namespace when used inside an application."
  application: String! @project
}

type Workspace implements WorkspaceInterface @interfaceFields {
  "Related edges."
  _edge: Workspace_Edge! @project(deep: true) @object
}

type WorkspacePartial implements WorkspaceInterface @interfaceFields {
  "The owning document."
  _owner: Workspace! @loadOwner(type: WORKSPACE)
  "Related edges."
  _edge: WorkspacePartial_Edge! @project(deep: true) @object
}

type Workspace_Edge {
  application: Workspace_EdgeApplication!
    @project(deep: true)
    @filterDeleted(field: "node")
  organization: Workspace_EdgeOrganization!
    @project(deep: true)
    @filterDeleted(field: "node")
}

type Workspace_EdgeApplication {
  node: ApplicationPartial! @project(deep: true, needs: ["node._deleted"])
}

type Workspace_EdgeOrganization {
  node: OrganizationPartial! @project(deep: true, needs: ["node._deleted"])
}

type WorkspacePartial_Edge {
  application: WorkspacePartial_EdgeApplication!
    @project(deep: true)
    @filterDeleted(field: "node")
  organization: WorkspacePartial_EdgeOrganization!
    @project(deep: true)
    @filterDeleted(field: "node")
}

type WorkspacePartial_EdgeApplication {
  node: ApplicationPartial! @project(deep: true, needs: ["node._deleted"])
}

type WorkspacePartial_EdgeOrganization {
  node: OrganizationPartial! @project(deep: true, needs: ["node._deleted"])
}

input QueryWorkspaceByNamespaceInput {
  "The default workspace namespace to lookup."
  namespace: String!
  "When in strict mode (default), an error will be thrown when the workspace is not found."
  strict: Boolean! = true
}

`;
